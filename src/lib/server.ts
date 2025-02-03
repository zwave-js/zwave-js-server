import { WebSocketServer, type WebSocket } from "ws";
import {
  getResponder,
  CiaoService,
  Protocol,
  Responder,
} from "@homebridge/ciao";
import {
  Driver,
  InclusionGrant,
  ZWaveError,
  ZWaveErrorCodes,
  getEnumMemberName,
} from "zwave-js";
import { libVersion } from "zwave-js";
import { DeferredPromise } from "alcalzone-shared/deferred-promise";
import { EventForwarder } from "./forward.js";
import type * as OutgoingMessages from "./outgoing_message.js";
import { IncomingMessage } from "./incoming_message.js";
import { dumpLogConfig, dumpState } from "./state.js";
import { Server as HttpServer, createServer } from "http";
import { EventEmitter, once } from "events";
import {
  dnssdServiceType,
  version,
  minSchemaVersion,
  maxSchemaVersion,
  applicationName,
} from "./const.js";
import { NodeMessageHandler } from "./node/message_handler.js";
import { ControllerMessageHandler } from "./controller/message_handler.js";
import {
  BaseError,
  ErrorCode,
  SchemaIncompatibleError,
  UnknownCommandError,
} from "./error.js";
import { Instance } from "./instance.js";
import { ServerCommand } from "./command.js";
import { DriverMessageHandler } from "./driver/message_handler.js";
import { LogContexts, LoggingEventForwarder } from "./logging.js";
import { BroadcastNodeMessageHandler } from "./broadcast_node/message_handler.js";
import { MulticastGroupMessageHandler } from "./multicast_group/message_handler.js";
import { EndpointMessageHandler } from "./endpoint/message_handler.js";
import { UtilsMessageHandler } from "./utils/message_handler.js";
import { inclusionUserCallbacks } from "./inclusion_user_callbacks.js";
import { MessageHandler } from "./message_handler.js";
import { ConfigManagerMessageHandler } from "./config_manager/message_handler.js";
import { ZnifferMessageHandler } from "./zniffer/message_handler.js";
import { stringifyReplacer } from "../util/stringify.js";

function getVersionData(driver: Driver): {
  homeId: number | undefined;
  driverVersion: string;
  serverVersion: string;
  minSchemaVersion: number;
  maxSchemaVersion: number;
} {
  return {
    homeId: driver.controller.homeId!,
    driverVersion: libVersion,
    serverVersion: version,
    minSchemaVersion: minSchemaVersion,
    maxSchemaVersion: maxSchemaVersion,
  };
}

export class Client {
  public receiveEvents = false;
  private _outstandingPing = false;
  public schemaVersion = minSchemaVersion;
  public receiveLogs = false;
  public additionalUserAgentComponents?: Record<string, string>;

  private instanceHandlers: Record<Instance, MessageHandler>;

  constructor(
    private socket: WebSocket,
    private clientsController: ClientsController,
    private driver: Driver,
    private logger: Logger,
    private remoteController: ZwavejsServerRemoteController,
  ) {
    socket.on("pong", () => {
      this._outstandingPing = false;
    });
    socket.on("message", (data: string) => this.receiveMessage(data));
    this.instanceHandlers = {
      [Instance.config_manager]: new ConfigManagerMessageHandler(),
      [Instance.controller]: new ControllerMessageHandler(
        this.clientsController,
        this.driver,
        this,
      ),
      [Instance.driver]: new DriverMessageHandler(
        this.remoteController,
        this.clientsController,
        this.logger,
        this.driver,
        this,
      ),
      [Instance.node]: new NodeMessageHandler(
        this.clientsController,
        this.driver,
        this,
      ),
      [Instance.multicast_group]: new MulticastGroupMessageHandler(
        this.driver,
        this,
      ),
      [Instance.broadcast_node]: new BroadcastNodeMessageHandler(
        this.driver,
        this,
      ),
      [Instance.endpoint]: new EndpointMessageHandler(this.driver, this),
      [Instance.utils]: new UtilsMessageHandler(),
      [Instance.zniffer]: new ZnifferMessageHandler(driver, clientsController),
    };
  }

  get isConnected(): boolean {
    return this.socket.readyState === this.socket.OPEN;
  }

  private setSchemaVersion(schemaVersion: number) {
    // Handle schema version
    this.schemaVersion = schemaVersion;
    if (
      this.schemaVersion < minSchemaVersion ||
      this.schemaVersion > maxSchemaVersion
    ) {
      throw new SchemaIncompatibleError(this.schemaVersion);
    }
  }

  async receiveMessage(data: string) {
    let msg: IncomingMessage;
    try {
      msg = JSON.parse(data);
    } catch (err) {
      // We don't have the message ID. Just close it.
      this.logger.debug(`Unable to parse data: ${data}`);
      this.socket.close();
      return;
    }

    try {
      if (msg.command === ServerCommand.initialize) {
        this.setSchemaVersion(msg.schemaVersion);
        this.additionalUserAgentComponents = msg.additionalUserAgentComponents;
        this.sendResultSuccess(msg.messageId, {});
        return;
      }

      if (msg.command === ServerCommand.setApiSchema) {
        this.setSchemaVersion(msg.schemaVersion);
        this.sendResultSuccess(msg.messageId, {});
        return;
      }

      if (msg.command === ServerCommand.startListening) {
        this.sendResultSuccess(
          msg.messageId,
          {
            state: dumpState(this.driver, this.schemaVersion),
          },
          true,
        );
        this.receiveEvents = true;
        return;
      }

      if (msg.command === ServerCommand.updateLogConfig) {
        this.driver.updateLogConfig(msg.config);
        this.sendResultSuccess(msg.messageId, {});
        return;
      }

      if (msg.command === ServerCommand.getLogConfig) {
        this.sendResultSuccess(msg.messageId, {
          config: dumpLogConfig(this.driver, this.schemaVersion),
        });
        return;
      }

      if (msg.command === ServerCommand.startListeningLogs) {
        this.receiveLogs = true;
        this.clientsController.configureLoggingEventForwarder(msg.filter);
        this.sendResultSuccess(msg.messageId, {});
        return;
      }

      if (msg.command === ServerCommand.stopListeningLogs) {
        this.receiveLogs = false;
        this.clientsController.cleanupLoggingEventForwarder();
        this.sendResultSuccess(msg.messageId, {});
        return;
      }

      const instance = msg.command.split(".")[0] as Instance;
      if (this.instanceHandlers[instance]) {
        return this.sendResultSuccess(
          msg.messageId,
          await this.instanceHandlers[instance].handle(msg),
        );
      }

      throw new UnknownCommandError(msg.command);
    } catch (err: unknown) {
      if (err instanceof BaseError) {
        this.logger.error("Message error", err);
        const { errorCode, name, message, stack, ...args } = err;
        return this.sendResultError(msg.messageId, errorCode, message, args);
      }
      if (err instanceof ZWaveError) {
        this.logger.error("Z-Wave error", err);
        return this.sendResultZWaveError(msg.messageId, err.code, err.message);
      }

      let error: Error;

      if (err instanceof Error) {
        error = err;
      } else {
        error = new Error(`${err}`);
      }
      this.logger.error("Unexpected error", error);
      this.sendResultError(
        msg.messageId,
        ErrorCode.unknownError,
        error.stack ?? error.message,
        {},
      );
    }
  }

  sendVersion() {
    this.sendData({
      type: "version",
      ...getVersionData(this.driver),
    });
  }

  sendResultSuccess(
    messageId: string,
    result: OutgoingMessages.OutgoingResultMessageSuccess["result"],
    compress = false,
  ) {
    this.sendData(
      {
        type: "result",
        success: true,
        messageId,
        result,
      },
      compress,
    );
  }

  sendResultError(
    messageId: string,
    errorCode: Omit<ErrorCode, "zwaveError">,
    message: string,
    args: OutgoingMessages.JSONValue,
  ) {
    if (this.schemaVersion <= 31) {
      // `sendResultError` didn't support passing the error message before schema 32.
      // We `sendResultZWaveError` instead so that we can pass the error message in
      // for the client to consume and display.
      this.sendResultZWaveError(
        messageId,
        -1 as any,
        `${errorCode}: ${message}`,
      );
    } else {
      this.sendData({
        type: "result",
        success: false,
        messageId,
        errorCode,
        message,
        args,
      });
    }
  }

  sendResultZWaveError(
    messageId: string,
    zjsErrorCode: ZWaveErrorCodes,
    message: string,
  ) {
    if (this.schemaVersion <= 31) {
      this.sendData({
        type: "result",
        success: false,
        messageId,
        errorCode: ErrorCode.zwaveError,
        zwaveErrorCode: zjsErrorCode,
        zwaveErrorMessage: message,
      });
    } else {
      this.sendData({
        type: "result",
        success: false,
        messageId,
        errorCode: ErrorCode.zwaveError,
        zwaveErrorCode: zjsErrorCode,
        zwaveErrorCodeName: getEnumMemberName(ZWaveErrorCodes, zjsErrorCode),
        zwaveErrorMessage: message,
      });
    }
  }

  sendEvent(event: OutgoingMessages.OutgoingEvent) {
    this.sendData({
      type: "event",
      event,
    });
  }

  sendData(data: OutgoingMessages.OutgoingMessage, compress = false) {
    this.socket.send(JSON.stringify(data, stringifyReplacer), { compress });
  }

  checkAlive() {
    if (this._outstandingPing) {
      this.disconnect();
      return;
    }
    this._outstandingPing = true;
    this.socket.ping();
  }

  disconnect() {
    this.socket.close();
  }
}

export class ClientsController extends EventEmitter {
  public clients: Array<Client> = [];
  private pingInterval?: NodeJS.Timeout;
  private eventForwarder?: EventForwarder;
  private cleanupScheduled = false;
  private loggingEventForwarder?: LoggingEventForwarder;
  public grantSecurityClassesPromise?: DeferredPromise<InclusionGrant | false>;
  public validateDSKAndEnterPinPromise?: DeferredPromise<string | false>;

  constructor(
    public driver: Driver,
    private logger: Logger,
    private remoteController: ZwavejsServerRemoteController,
  ) {
    super();
  }

  addSocket(socket: WebSocket) {
    this.logger.debug("New client");
    const client = new Client(
      socket,
      this,
      this.driver,
      this.logger,
      this.remoteController,
    );
    socket.on("error", (error) => {
      this.logger.error("Client socket error", error);
    });
    socket.on("close", (code, reason) => {
      this.logger.info("Client disconnected");
      this.logger.debug(`Code ${code}: ${reason}`);
      this.scheduleClientCleanup();
    });
    client.sendVersion();
    this.clients.push(client);

    if (this.pingInterval === undefined) {
      this.pingInterval = setInterval(() => {
        const newClients = [];

        for (const client of this.clients) {
          if (client.isConnected) {
            newClients.push(client);
          } else {
            client.disconnect();
          }
        }

        this.clients = newClients;
      }, 30000);
    }

    if (this.eventForwarder === undefined) {
      this.eventForwarder = new EventForwarder(this);
      this.eventForwarder.start();
    }
  }

  get loggingEventForwarderStarted(): boolean {
    return this.loggingEventForwarder?.started === true;
  }

  public restartLoggingEventForwarderIfNeeded() {
    this.loggingEventForwarder?.restartIfNeeded();
  }

  public configureLoggingEventForwarder(filter?: Partial<LogContexts>) {
    if (this.loggingEventForwarder === undefined) {
      this.loggingEventForwarder = new LoggingEventForwarder(
        this,
        this.driver,
        this.logger,
      );
    }
    if (!this.loggingEventForwarderStarted) {
      this.loggingEventForwarder?.start(filter);
    }
  }

  public cleanupLoggingEventForwarder() {
    if (
      this.clients.filter((cl) => cl.receiveLogs).length == 0 &&
      this.loggingEventForwarderStarted
    ) {
      this.loggingEventForwarder?.stop();
    }
  }

  private scheduleClientCleanup() {
    if (this.cleanupScheduled) {
      return;
    }
    this.cleanupScheduled = true;
    setTimeout(() => this.cleanupClients(), 0);
  }

  private cleanupClients() {
    this.cleanupScheduled = false;
    this.clients = this.clients.filter((cl) => cl.isConnected);
    this.cleanupLoggingEventForwarder();
  }

  disconnect() {
    if (this.pingInterval !== undefined) {
      clearInterval(this.pingInterval);
    }
    this.pingInterval = undefined;
    this.clients.forEach((client) => client.disconnect());
    this.clients = [];
    this.cleanupLoggingEventForwarder();
  }
}

interface ZwavejsServerOptions {
  port?: number;
  host?: string;
  logger?: Logger;
  enableDNSServiceDiscovery?: boolean;
}

export interface Logger {
  error(message: string | Error, error?: Error): void;
  warn(message: string): void;
  info(message: string): void;
  debug(message: string): void;
}

/**
 * This class allows the hard reset driver command to be passed to the
 * ClientsController, Client, and Message Handler instances without
 * providing access to the base server and eventing system.
 */
export class ZwavejsServerRemoteController {
  constructor(
    private driver: Driver,
    private zwaveJsServer: ZwavejsServer,
  ) {}

  public async hardResetController() {
    await this.driver.hardReset();
    this.zwaveJsServer.emit("hard reset");
  }
}

export class ZwavejsServer extends EventEmitter {
  private server?: HttpServer;
  private wsServer?: WebSocketServer;
  private sockets?: ClientsController;
  private logger: Logger;
  private defaultPort: number = 3000;
  private responder?: Responder;
  private service?: CiaoService;
  private remoteController: ZwavejsServerRemoteController;

  constructor(
    private driver: Driver,
    private options: ZwavejsServerOptions = {},
  ) {
    super();
    this.remoteController = new ZwavejsServerRemoteController(driver, this);
    this.logger = options.logger ?? console;
  }

  async start(shouldSetInclusionUserCallbacks: boolean = false) {
    if (!this.driver.ready) {
      throw new Error("Cannot start server when driver not ready");
    }

    this.driver.updateUserAgent({ [applicationName]: version });
    this.server = createServer();
    this.wsServer = new WebSocketServer({
      server: this.server,
      perMessageDeflate: true,
    });

    this.sockets = new ClientsController(
      this.driver,
      this.logger,
      this.remoteController,
    );
    if (shouldSetInclusionUserCallbacks) {
      this.setInclusionUserCallbacks();
    }
    this.wsServer.on("connection", (socket) => this.sockets!.addSocket(socket));

    const port = this.options.port || this.defaultPort;
    const host = this.options.host;
    const localEndpointString = `${host ?? "<all interfaces>"}:${port}`;

    this.logger.debug(`Starting server on ${localEndpointString}`);

    this.wsServer.on("error", this.onError.bind(this, this.wsServer));
    this.server.on("error", this.onError.bind(this, this.server));
    this.server.listen(port, host);
    await once(this.server, "listening");
    this.emit("listening");
    this.logger.info(`ZwaveJS server listening on ${localEndpointString}`);
    if (this.options.enableDNSServiceDiscovery) {
      this.responder = getResponder();
      this.service = this.responder.createService({
        name: this.driver.controller.homeId!.toString(),
        port,
        type: dnssdServiceType,
        protocol: Protocol.TCP,
        txt: getVersionData(this.driver),
      });
      this.service.advertise().then(() => {
        this.logger.info(`DNS Service Discovery enabled`);
      });
    }
  }

  setInclusionUserCallbacks(): void {
    if (this.sockets === undefined) {
      throw new Error(
        "Server must be started before setting the inclusion user callbacks",
      );
    }
    this.driver.updateOptions({
      inclusionUserCallbacks: inclusionUserCallbacks(this.sockets),
    });
  }

  private onError(sourceClass: EventEmitter, error: Error) {
    this.emit("error", error, sourceClass);
    this.logger.error(error);
  }

  async destroy() {
    this.logger.debug(`Closing server...`);
    if (this.sockets) {
      this.sockets.disconnect();
      this.sockets.removeAllListeners();
      delete this.sockets;
    }
    if (this.wsServer) {
      this.wsServer.close();
      await once(this.wsServer, "close");
      this.wsServer.removeAllListeners();
      delete this.wsServer;
    }
    if (this.server) {
      this.server.close();
      await once(this.server, "close");
      this.server.removeAllListeners();
      delete this.server;
    }
    if (this.service) {
      await this.service.end();
      await this.service.destroy();
      this.service.removeAllListeners();
      delete this.service;
    }
    if (this.responder) {
      await this.responder.shutdown();
      delete this.responder;
    }
    this.logger.info(`Server closed`);
  }
}

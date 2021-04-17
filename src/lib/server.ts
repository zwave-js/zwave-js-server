import Transport from "winston-transport";
import ws from "ws";
import type WebSocket from "ws";
import type { Driver } from "zwave-js";
import { libVersion } from "zwave-js";
import { createDefaultTransportFormat } from "@zwave-js/core";
import type { ZWaveLogInfo } from "@zwave-js/core";
import { EventForwarder } from "./forward";
import type * as OutgoingMessages from "./outgoing_message";
import { IncomingMessage } from "./incoming_message";
import { dumpLogConfig, dumpState } from "./state";
import { Server as HttpServer, createServer } from "http";
import { EventEmitter, once } from "events";
import { version, minSchemaVersion, maxSchemaVersion } from "./const";
import { NodeMessageHandler } from "./node/message_handler";
import { ControllerMessageHandler } from "./controller/message_handler";
import { IncomingMessageController } from "./controller/incoming_message";
import {
  BaseError,
  ErrorCode,
  SchemaIncompatibleError,
  UnknownCommandError,
} from "./error";
import { Instance } from "./instance";
import { IncomingMessageNode } from "./node/incoming_message";
import { ServerCommand } from "./command";
import { DriverMessageHandler } from "./driver/message_handler";
import { IncomingMessageDriver } from "./driver/incoming_message";
import { LoggingEventForwarder } from "./logging";

export class Client {
  public receiveEvents = false;
  private _outstandingPing = false;
  public schemaVersion = minSchemaVersion;
  public receiveLogs = false;

  private instanceHandlers: Record<
    Instance,
    (
      message: IncomingMessage
    ) => Promise<OutgoingMessages.OutgoingResultMessageSuccess["result"]>
  > = {
    [Instance.controller]: (message) =>
      ControllerMessageHandler.handle(
        message as IncomingMessageController,
        this.driver
      ),
    [Instance.driver]: (message) =>
      DriverMessageHandler.handle(
        message as IncomingMessageDriver,
        this.driver,
        this
      ),
    [Instance.node]: (message) =>
      NodeMessageHandler.handle(
        message as IncomingMessageNode,
        this.driver,
        this
      ),
  };

  constructor(
    private socket: WebSocket,
    private clientsController: ClientsController,
    private driver: Driver,
    private logger: Logger
  ) {
    socket.on("pong", () => {
      this._outstandingPing = false;
    });
    socket.on("message", (data: string) => this.receiveMessage(data));
  }

  get isConnected(): boolean {
    return this.socket.readyState === this.socket.OPEN;
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
      if (msg.command === ServerCommand.setApiSchema) {
        // Handle schema version
        this.schemaVersion = msg.schemaVersion;
        if (
          this.schemaVersion < minSchemaVersion ||
          this.schemaVersion > maxSchemaVersion
        ) {
          throw new SchemaIncompatibleError(this.schemaVersion);
        }
        this.sendResultSuccess(msg.messageId, {});
        return;
      }

      if (msg.command === ServerCommand.startListening) {
        this.sendResultSuccess(msg.messageId, {
          state: dumpState(this.driver, this.schemaVersion),
        });
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

      if (msg.command === ServerCommand.startListeningToLogs) {
        this.receiveLogs = true;
        if (!this.clientsController.loggingEventForwarderStarted) {
          this.clientsController.startLoggingEventForwarder();
        }
        this.sendResultSuccess(msg.messageId, {});
        return;
      }

      if (msg.command === ServerCommand.stopListeningToLogs) {
        this.receiveLogs = false;
        this.sendResultSuccess(msg.messageId, {});
        return;
      }

      const instance = msg.command.split(".")[0] as Instance;
      if (this.instanceHandlers[instance]) {
        return this.sendResultSuccess(
          msg.messageId,
          await this.instanceHandlers[instance](msg)
        );
      }

      throw new UnknownCommandError(msg.command);
    } catch (err: unknown) {
      if (err instanceof BaseError) {
        this.logger.error("Message error", err);
        return this.sendResultError(msg.messageId, err.errorCode);
      }

      this.logger.error("Unexpected error", err as Error);
      this.sendResultError(msg.messageId, ErrorCode.unknownError);
    }
  }

  sendVersion() {
    this.sendData({
      type: "version",
      driverVersion: libVersion,
      serverVersion: version,
      homeId: this.driver.controller.homeId,
      minSchemaVersion: minSchemaVersion,
      maxSchemaVersion: maxSchemaVersion,
    });
  }

  sendResultSuccess(
    messageId: string,
    result: OutgoingMessages.OutgoingResultMessageSuccess["result"]
  ) {
    this.sendData({
      type: "result",
      success: true,
      messageId,
      result,
    });
  }

  sendResultError(messageId: string, errorCode: string) {
    this.sendData({
      type: "result",
      success: false,
      messageId,
      errorCode,
    });
  }

  sendEvent(event: OutgoingMessages.OutgoingEvent) {
    this.sendData({
      type: "event",
      event,
    });
  }

  sendData(data: OutgoingMessages.OutgoingMessage) {
    this.socket.send(JSON.stringify(data));
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
export class ClientsController {
  public clients: Array<Client> = [];
  private pingInterval?: NodeJS.Timeout;
  private eventForwarder?: EventForwarder;
  private cleanupScheduled = false;
  private loggingEventForwarder?: LoggingEventForwarder;

  constructor(
    public driver: Driver,
    private logger: Logger,
    private server: ZwavejsServer
  ) {}

  addSocket(socket: WebSocket) {
    this.logger.debug("New client");
    const client = new Client(socket, this, this.driver, this.logger);
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

    if (this.loggingEventForwarder === undefined) {
      this.loggingEventForwarder = new LoggingEventForwarder(this, this.server);
      this.loggingEventForwarder.start();
    }
  }

  get loggingEventForwarderStarted(): boolean {
    if (
      !this.loggingEventForwarder ||
      this.loggingEventForwarder === undefined
    ) {
      return false;
    }
    return this.loggingEventForwarder.started;
  }

  public startLoggingEventForwarder() {
    this.loggingEventForwarder?.start();
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
    if (
      this.clients.filter((cl) => cl.receiveLogs).length == 0 &&
      this.loggingEventForwarderStarted
    ) {
      this.loggingEventForwarder?.stop();
    }
  }

  disconnect() {
    if (this.pingInterval !== undefined) {
      clearInterval(this.pingInterval);
    }
    this.pingInterval = undefined;
    this.clients.forEach((client) => client.disconnect());
    this.clients = [];
  }
}
interface ZwavejsServerOptions {
  port: number;
  logger?: Logger;
}

export interface Logger {
  error(message: string | Error, error?: Error): void;
  warn(message: string): void;
  info(message: string): void;
  debug(message: string): void;
}

export interface ZwavejsServer {
  start(): void;
  destroy(): void;
  on(event: "listening", listener: () => void): this;
  on(event: "error", listener: (error: Error) => void): this;
  on(event: "logging", listener: (message: string) => void): this;
}

export class ZwavejsServer extends EventEmitter {
  private server?: HttpServer;
  private wsServer?: ws.Server;
  private sockets?: ClientsController;
  private logger: Logger;
  private serverTransport?: EventEmitterLogTransport;

  constructor(private driver: Driver, private options: ZwavejsServerOptions) {
    super();
    this.logger = options.logger ?? console;
  }

  async start() {
    if (!this.driver.ready) {
      throw new Error("Cannot start server when driver not ready");
    }

    // Create log transport for server and update the drivers log configuration
    this.serverTransport = new EventEmitterLogTransport(this);
    const transports = this.driver.getLogConfig().transports || [];
    transports.push(this.serverTransport);
    this.driver.updateLogConfig({ transports });

    this.server = createServer();
    this.wsServer = new ws.Server({ server: this.server });
    this.sockets = new ClientsController(this.driver, this.logger, this);
    this.wsServer.on("connection", (socket) => this.sockets!.addSocket(socket));

    this.logger.debug(`Starting server on port ${this.options.port}`);

    this.server.on("error", this.onError.bind(this));
    this.server.listen(this.options.port);
    await once(this.server, "listening");
    this.emit("listening");
    this.logger.info(`ZwaveJS server listening on port ${this.options.port}`);
  }

  private onError(error: Error) {
    this.emit("error", error);
    this.logger.error(error);
  }

  async destroy() {
    this.logger.debug(`Closing server...`);
    if (this.sockets) {
      this.sockets.disconnect();
    }
    if (this.server) {
      this.server.close();
      await once(this.server, "close");
    }

    this.logger.info(`Server closed`);
  }
}

export class EventEmitterLogTransport extends Transport {
  private messageSymbol: Symbol;

  public constructor(private emitter: EventEmitter) {
    super({ format: createDefaultTransportFormat(false, false) });
    this.messageSymbol = Symbol.for("message");
  }

  public log(info: ZWaveLogInfo, next: () => void): any {
    this.emitter.emit("logging", info[this.messageSymbol as any]);
    next();
  }
}

import Transport from "winston-transport";
import { ConfigLogContext } from "@zwave-js/config";
import { createDefaultTransportFormat, NodeLogContext } from "@zwave-js/core";
import type { ZWaveLogInfo } from "@zwave-js/core";
import { SerialLogContext } from "@zwave-js/serial";
import { ClientsController, Logger } from "./server";
import { ControllerLogContext, DriverLogContext, Driver } from "zwave-js";

export type LogContexts =
  | ConfigLogContext
  | ControllerLogContext
  | DriverLogContext
  | NodeLogContext
  | SerialLogContext;

export class LoggingEventForwarder {
  /**
   * Only load this once the driver is ready.
   *
   * @param clients
   * @param driver
   */
  private serverTransport?: WebSocketLogTransport;

  constructor(
    private clients: ClientsController,
    private driver: Driver,
    private logger: Logger
  ) {}

  public get started(): boolean {
    return this.serverTransport !== undefined;
  }

  start(filter?: LogContexts) {
    var { transports, level } = this.driver.getLogConfig();
    // Set the log level before attaching the transport
    this.logger.info("Starting logging event forwarder at " + level + " level");
    this.serverTransport = new WebSocketLogTransport(
      level as string,
      this.clients,
      filter
    );
    transports = transports || [];
    transports.push(this.serverTransport);
    this.driver.updateLogConfig({ transports });
  }

  stop() {
    this.logger.info("Stopping logging event forwarder");
    const transports = this.driver
      .getLogConfig()
      .transports.filter((transport) => transport !== this.serverTransport);
    this.driver.updateLogConfig({ transports });
    delete this.serverTransport;
  }

  restartIfNeeded() {
    var { level } = this.driver.getLogConfig();
    if (this.started && this.serverTransport?.level != level) {
      this.stop();
      this.start();
    }
  }
}

class WebSocketLogTransport extends Transport {
  private messageSymbol = Symbol.for("message");

  public constructor(
    level: string,
    private clients: ClientsController,
    private filter?: { [key: string]: any }
  ) {
    super({
      format: createDefaultTransportFormat(false, false),
      level,
    });
  }

  public log(info: ZWaveLogInfo, next: () => void): any {
    // If there is no filter or if all key/value pairs match from filter, forward
    // the message to the client
    if (
      !this.filter ||
      Object.keys(this.filter).every((key) => {
        return this.filter && key in info && this.filter[key] === info[key];
      }, this)
    ) {
      // Forward logs on to clients that are currently
      // receiving logs
      this.clients.clients
        .filter((cl) => cl.receiveLogs && cl.isConnected)
        .forEach((client) =>
          client.sendEvent({
            source: "driver",
            event: "logging",
            formattedMessage: info[this.messageSymbol as any],
            ...info,
          })
        );
    }
    next();
  }
}

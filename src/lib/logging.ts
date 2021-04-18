import Transport from "winston-transport";
import { createDefaultTransportFormat } from "@zwave-js/core";
import type { ZWaveLogInfo } from "@zwave-js/core";
import { ClientsController, Logger } from "./server";
import { Driver } from "zwave-js";

export class LoggingEventForwarder {
  /**
   * Only load this once the driver is ready.
   *
   * @param clients
   * @param driver
   */
  private serverTransport?: WebSocketLogTransport;
  public started: boolean = false;

  constructor(private clients: ClientsController, private driver: Driver) {
    // Create log transport for server
    this.serverTransport = new WebSocketLogTransport(this.clients);
  }

  start() {
    if (!this.serverTransport || this.serverTransport === undefined) {
      throw new Error("Cannot start listening to logs");
    }
    var { transports, level } = this.driver.getLogConfig();
    // Set the log level before attaching the transport
    this.serverTransport.level = level as string;
    transports = transports || [];
    transports.push(this.serverTransport);
    this.driver.updateLogConfig({ transports });
    this.started = true;
  }

  stop() {
    const transports = this.driver
      .getLogConfig()
      .transports.filter((transport) => transport !== this.serverTransport);
    this.driver.updateLogConfig({ transports });
    this.started = false;
  }
}

class WebSocketLogTransport extends Transport {
  private messageSymbol: Symbol;

  public constructor(private clients: ClientsController) {
    super({
      format: createDefaultTransportFormat(false, false),
    });
    this.messageSymbol = Symbol.for("message");
  }

  public log(info: ZWaveLogInfo, next: () => void): any {
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
    next();
  }
}

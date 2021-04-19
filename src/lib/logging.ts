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

  constructor(private clients: ClientsController, private driver: Driver) {}

  public get started(): boolean {
    return this.serverTransport != undefined;
  }

  start() {
    var { transports, level } = this.driver.getLogConfig();
    // Set the log level before attaching the transport
    this.serverTransport = new WebSocketLogTransport(
      level as string,
      this.clients
    );
    transports = transports || [];
    transports.push(this.serverTransport);
    this.driver.updateLogConfig({ transports });
  }

  stop() {
    const transports = this.driver
      .getLogConfig()
      .transports.filter((transport) => transport !== this.serverTransport);
    this.driver.updateLogConfig({ transports });
    delete this.serverTransport;
  }
}

class WebSocketLogTransport extends Transport {
  private messageSymbol = Symbol.for("message");

  public constructor(level: string, private clients: ClientsController) {
    super({
      format: createDefaultTransportFormat(false, false),
      level,
    });
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

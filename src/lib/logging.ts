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

  constructor(private clients: ClientsController, private driver: Driver) {}

  start() {
    var { transports, level } = this.driver.getLogConfig();
    transports = transports || [];
    // Create log transport for server, we need to do this every
    // time we attach so we can get the current log level
    this.serverTransport = new WebSocketLogTransport(
      level as string,
      this.clients
    );
    transports.push(this.serverTransport);
    this.driver.updateLogConfig({ transports });
    this.started = true;
  }

  stop() {
    var transports = this.driver.getLogConfig().transports;
    transports = transports.filter(
      (transport) => transport !== this.serverTransport
    );
    this.driver.updateLogConfig({ transports });
    delete this.serverTransport;
    this.started = false;
  }
}

class WebSocketLogTransport extends Transport {
  private messageSymbol: Symbol;

  public constructor(logLevel: string, private clients: ClientsController) {
    super({
      level: logLevel,
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

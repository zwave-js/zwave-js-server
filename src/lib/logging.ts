import Transport from "winston-transport";
import { createDefaultTransportFormat } from "@zwave-js/core";
import type { ZWaveLogInfo } from "@zwave-js/core";
import { ClientsController, ZwavejsServer } from "./server";
import { Driver } from "zwave-js";

export class LoggingEventForwarder {
  /**
   * Only load this once the driver is ready.
   *
   * @param clients
   * @param driver
   */
  private serverTransport?: EventEmitterLogTransport;
  public started: boolean = false;

  constructor(private clients: ClientsController, private driver: Driver) {
    // Create log transport for server
    this.serverTransport = new EventEmitterLogTransport(this.clients);
  }

  start() {
    if (!this.serverTransport || this.serverTransport === undefined) {
      throw new Error("Cannot start listening to logs");
    }
    const transports = this.driver.getLogConfig().transports || [];
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
    this.started = false;
  }
}

class EventEmitterLogTransport extends Transport {
  private messageSymbol: Symbol;

  public constructor(private clients: ClientsController) {
    super({ format: createDefaultTransportFormat(false, false) });
    this.messageSymbol = Symbol.for("message");
  }

  public log(info: ZWaveLogInfo, next: () => void): any {
    const { message, ...partialInfo } = info;
    // Forward logs on to clients that are currently
    // receiving logs
    this.clients.clients
      .filter((cl) => cl.receiveLogs && cl.isConnected)
      .forEach((client) =>
        client.sendEvent({
          source: "driver",
          event: "logging",
          message: info[this.messageSymbol as any],
          ...partialInfo,
        })
      );
    next();
  }
}

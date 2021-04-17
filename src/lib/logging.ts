import { ClientsController, ZwavejsServer } from "./server";

export class LoggingEventForwarder {
  /**
   * Only load this once the driver is ready.
   *
   * @param clients
   * @param server
   */
  public started: boolean = false;

  constructor(
    private clients: ClientsController,
    private server: ZwavejsServer
  ) {}

  start() {
    // Forward logging events on to clients that are currently
    // receiving logs
    this.server.on("logging", (message: string) => {
      this.clients.clients
        .filter((cl) => cl.receiveLogs && cl.isConnected)
        .forEach((client) =>
          client.sendEvent({
            source: "driver",
            event: "logging",
            message,
          })
        );
    });
    this.started = true;
  }

  stop() {
    this.server.removeAllListeners("logging");
    this.started = false;
  }
}

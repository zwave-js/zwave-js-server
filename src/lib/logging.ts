import {
  ControllerEvents,
  NodeStatus,
  ZWaveNode,
  ZWaveNodeEvents,
  ZWaveNodeMetadataUpdatedArgs,
} from "zwave-js";
import {
  CommandClasses,
  ConfigurationMetadata,
  ZWaveLogInfo,
} from "@zwave-js/core";
import { OutgoingEvent } from "./outgoing_message";
import { dumpConfigurationMetadata, dumpMetadata, dumpNode } from "./state";
import { Client, ClientsController, ZwavejsServer } from "./server";

export class LoggingEventForwarder {
  /**
   * Only load this once the driver is ready.
   *
   * @param clients
   * @param server
   */
  public started: boolean = false;

  constructor(
    public clients: ClientsController,
    private server: ZwavejsServer
  ) {}

  // Forward logging events on to clients that are currently
  // receiving logs
  forwardLogging(message: string) {
    this.clients.clients
      .filter((cl) => cl.receiveLogs && cl.isConnected)
      .forEach((client) =>
        client.sendEvent({
          source: "driver",
          event: "logging",
          message,
        })
      );
  }

  start() {
    this.server.on("logging", this.forwardLogging);
    this.started = true;
  }

  stop() {
    this.server.removeListener("logging", this.forwardLogging);
    this.started = false;
  }
}

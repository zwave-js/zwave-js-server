import { Driver, Zniffer } from "zwave-js";
import { UnknownCommandError } from "../error";
import { Client, ClientsController } from "../server";
import { ZnifferCommand } from "./command";
import { IncomingMessageZniffer } from "./incoming_message";
import { ZnifferResultTypes } from "./outgoing_message";
import { OutgoingEvent } from "../outgoing_message";

export class ZnifferMessageHandler {
  private driver: Driver;
  private clientsController: ClientsController;
  private zniffer?: Zniffer;

  constructor(driver: Driver, clientsController: ClientsController) {
    this.driver = driver;
    this.clientsController = clientsController;
  }
  forwardEvent(data: OutgoingEvent, minSchemaVersion?: number) {
    // Forward event to all clients
    this.clientsController.clients.forEach((client) =>
      this.sendEvent(client, data, minSchemaVersion),
    );
  }

  sendEvent(
    client: Client,
    data: OutgoingEvent,
    minSchemaVersion: number = 38, // Introduced in schema version 38
  ) {
    // Send event to connected client only
    if (
      client.receiveEvents &&
      client.isConnected &&
      client.schemaVersion >= minSchemaVersion
    ) {
      client.sendEvent(data);
    }
  }

  async handle(
    message: IncomingMessageZniffer,
  ): Promise<ZnifferResultTypes[ZnifferCommand]> {
    const { command } = message;

    if (message.command != ZnifferCommand.start && !this.zniffer) {
      throw new Error("Zniffer is not running");
    }
    switch (message.command) {
      case ZnifferCommand.start: {
        if (this.zniffer) {
          throw new Error("Zniffer is already running");
        }
        const { logConfig, securityKeys, securityKeysLongRange } =
          this.driver.options;
        this.zniffer = new Zniffer(message.devicePath, {
          logConfig,
          securityKeys,
          securityKeysLongRange,
          ...message.options,
        });
        this.zniffer
          .on("ready", () =>
            this.forwardEvent({
              source: "zniffer",
              event: "ready",
            }),
          )
          .on("corrupted frame", (corruptedFrame, rawDate) =>
            this.forwardEvent({
              source: "zniffer",
              event: "corrupted frame",
              corruptedFrame,
              rawDate,
            }),
          )
          .on("frame", (frame, rawData) =>
            this.forwardEvent({
              source: "zniffer",
              event: "frame",
              frame,
              rawData,
            }),
          )
          .on("error", (error) =>
            this.forwardEvent({
              source: "zniffer",
              event: "ready",
              error,
            }),
          );
        await this.zniffer.init();
        await this.zniffer.start();
        return {};
      }
      case ZnifferCommand.clearCapturedFrames: {
        this.zniffer?.clearCapturedFrames();
        return {};
      }
      case ZnifferCommand.getCaptureAsZLFBuffer: {
        return { capture: this.zniffer!.getCaptureAsZLFBuffer() };
      }
      case ZnifferCommand.stop: {
        await this.zniffer?.stop();
        this.zniffer?.removeAllListeners();
        await this.zniffer?.destroy();
        this.zniffer = undefined;
        return {};
      }
      case ZnifferCommand.capturedFrames: {
        return { capturedFrames: this.zniffer!.capturedFrames };
      }
      default: {
        throw new UnknownCommandError(command);
      }
    }
  }
}

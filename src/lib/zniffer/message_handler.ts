import { Driver, Zniffer, ZnifferOptions } from "zwave-js";
import { UnknownCommandError } from "../error";
import { Client, ClientsController } from "../server";
import { ZnifferCommand } from "./command";
import { IncomingMessageZniffer } from "./incoming_message";
import { ZnifferResultTypes } from "./outgoing_message";
import { OutgoingEvent } from "../outgoing_message";

export class ZnifferMessageHandler {
  private zniffer?: Zniffer;

  constructor(
    private driver: Driver,
    private clientsController: ClientsController,
  ) {}

  forwardEvent(data: OutgoingEvent, minSchemaVersion: number = 38) {
    // Forward event to all clients
    this.clientsController.clients.forEach((client) =>
      this.sendEvent(client, data, minSchemaVersion),
    );
  }

  sendEvent(client: Client, data: OutgoingEvent, minSchemaVersion?: number) {
    // Send event to connected client only
    if (
      client.receiveEvents &&
      client.isConnected &&
      client.schemaVersion >= (minSchemaVersion ?? 0)
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
        if (message.options.logConfig === undefined) {
          message.options.logConfig = this.driver.options.logConfig;
        }
        if (message.options.securityKeys === undefined) {
          message.options.securityKeys = this.driver.options.securityKeys;
        }
        if (message.options.securityKeysLongRange === undefined) {
          message.options.securityKeysLongRange =
            this.driver.options.securityKeysLongRange;
        }
        this.zniffer = new Zniffer(message.devicePath, message.options);
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
      case ZnifferCommand.supportedFrequencies: {
        return { frequencies: this.zniffer!.supportedFrequencies };
      }
      case ZnifferCommand.currentFrequency: {
        return { frequency: this.zniffer!.currentFrequency };
      }
      case ZnifferCommand.setFrequency: {
        await this.zniffer?.setFrequency(message.frequency);
        return {};
      }
      default: {
        throw new UnknownCommandError(command);
      }
    }
  }
}

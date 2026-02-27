import { Driver, Zniffer } from "zwave-js";
import { UnknownCommandError } from "../error.js";
import { ClientsController } from "../server.js";
import { ZnifferCommand } from "./command.js";
import { IncomingMessageZniffer } from "./incoming_message.js";
import { ZnifferResultTypes } from "./outgoing_message.js";
import { MessageHandler } from "../message_handler.js";

export class ZnifferMessageHandler implements MessageHandler {
  private zniffer?: Zniffer;

  constructor(
    private driver: Driver,
    private clientsController: ClientsController,
  ) {}

  async handle(
    message: IncomingMessageZniffer,
  ): Promise<ZnifferResultTypes[ZnifferCommand]> {
    const { command } = message;

    if (message.command != ZnifferCommand.init && !this.zniffer) {
      throw new Error("Zniffer is not running");
    }
    switch (message.command) {
      case ZnifferCommand.init: {
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
            this.clientsController.sendEventToListeningClients(
              { source: "zniffer", event: "ready" },
              { minSchemaVersion: 38 },
            ),
          )
          .on("corrupted frame", (corruptedFrame, rawDate) =>
            this.clientsController.sendEventToListeningClients(
              {
                source: "zniffer",
                event: "corrupted frame",
                corruptedFrame,
                rawDate,
              },
              { minSchemaVersion: 38 },
            ),
          )
          .on("frame", (frame, rawData) =>
            this.clientsController.sendEventToListeningClients(
              { source: "zniffer", event: "frame", frame, rawData },
              { minSchemaVersion: 38 },
            ),
          )
          .on("error", (error) =>
            this.clientsController.sendEventToListeningClients(
              { source: "zniffer", event: "error", error },
              { minSchemaVersion: 38 },
            ),
          );
        await this.zniffer.init();
        return {};
      }
      case ZnifferCommand.start: {
        await this.zniffer?.start();
        return {};
      }
      case ZnifferCommand.clearCapturedFrames: {
        this.zniffer?.clearCapturedFrames();
        return {};
      }
      case ZnifferCommand.getCaptureAsZLFBuffer: {
        return {
          capture: Buffer.from(this.zniffer!.getCaptureAsZLFBuffer().buffer),
        };
      }
      case ZnifferCommand.stop: {
        await this.zniffer?.stop();
        return {};
      }
      case ZnifferCommand.destroy: {
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
      // Long Range
      case ZnifferCommand.getLRRegions: {
        return { regions: Array.from(this.zniffer!.lrRegions) };
      }
      case ZnifferCommand.getCurrentLRChannelConfig: {
        return { channelConfig: this.zniffer!.currentLRChannelConfig };
      }
      case ZnifferCommand.getSupportedLRChannelConfigs: {
        return { channelConfigs: this.zniffer!.supportedLRChannelConfigs };
      }
      case ZnifferCommand.setLRChannelConfig: {
        await this.zniffer?.setLRChannelConfig(message.channelConfig);
        return {};
      }
      // File I/O
      case ZnifferCommand.saveCaptureToFile: {
        await this.zniffer!.saveCaptureToFile(message.filePath);
        return {};
      }
      case ZnifferCommand.loadCaptureFromFile: {
        await this.zniffer!.loadCaptureFromFile(message.filePath);
        return {};
      }
      case ZnifferCommand.loadCaptureFromBuffer: {
        const data = Buffer.from(message.data, "base64");
        await this.zniffer!.loadCaptureFromBuffer(data);
        return {};
      }
      default: {
        throw new UnknownCommandError(command);
      }
    }
  }
}

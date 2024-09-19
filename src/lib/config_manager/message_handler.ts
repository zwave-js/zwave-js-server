import { ConfigManager } from "@zwave-js/config";
import { UnknownCommandError } from "../error";
import { ConfigManagerCommand } from "./command";
import { IncomingMessageConfigManager } from "./incoming_message";
import { ConfigManagerResultTypes } from "./outgoing_message";
import { MessageHandler } from "../message_handler";

export class ConfigManagerMessageHandler extends MessageHandler {
  private configManager: ConfigManager = new ConfigManager();

  constructor() {
    super();
    this.configManager.loadDeviceIndex().then(() => {});
  }

  async handle(
    message: IncomingMessageConfigManager,
  ): Promise<ConfigManagerResultTypes[ConfigManagerCommand]> {
    const { command } = message;

    switch (message.command) {
      case ConfigManagerCommand.lookupDevice: {
        const config = await this.configManager.lookupDevice(
          message.manufacturerId,
          message.productType,
          message.productId,
          message.firmwareVersion,
        );
        return { config };
      }
      case ConfigManagerCommand.loadManufacturers: {
        await this.configManager.loadManufacturers();
        return {};
      }
      case ConfigManagerCommand.lookupManufacturer: {
        const name = this.configManager.lookupManufacturer(
          message.manufacturerId,
        );
        return { name };
      }
      case ConfigManagerCommand.loadDeviceIndex: {
        await this.configManager.loadDeviceIndex();
        return {};
      }
      case ConfigManagerCommand.getIndex: {
        const index = this.configManager.getIndex();
        return { index };
      }
      case ConfigManagerCommand.loadFulltextDeviceIndex: {
        await this.configManager.loadFulltextDeviceIndex();
        return {};
      }
      case ConfigManagerCommand.getFulltextIndex: {
        const index = this.configManager.getFulltextIndex();
        return { index };
      }
      case ConfigManagerCommand.lookupDevicePreserveConditions: {
        const config = await this.configManager.lookupDevicePreserveConditions(
          message.manufacturerId,
          message.productType,
          message.productId,
          message.firmwareVersion,
        );
        return { config };
      }
      case ConfigManagerCommand.manufacturers: {
        const manufacturers = this.configManager.manufacturers;
        return { manufacturers };
      }
      case ConfigManagerCommand.loadAll: {
        await this.configManager.loadAll();
        return {};
      }
      case ConfigManagerCommand.configVersion: {
        return { configVersion: this.configManager.configVersion };
      }
      default: {
        throw new UnknownCommandError(command);
      }
    }
  }
}

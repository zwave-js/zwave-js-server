import { UnknownCommandError } from "../error.js";
import { ConfigManagerCommand } from "./command.js";
import { IncomingMessageConfigManager } from "./incoming_message.js";
import { ConfigManagerResultTypes } from "./outgoing_message.js";
import { MessageHandler } from "../message_handler.js";
import { Driver } from "zwave-js";

export class ConfigManagerMessageHandler implements MessageHandler {
  constructor(private driver: Driver) {}

  async handle(
    message: IncomingMessageConfigManager,
  ): Promise<ConfigManagerResultTypes[ConfigManagerCommand]> {
    const { command } = message;

    switch (message.command) {
      case ConfigManagerCommand.lookupDevice: {
        const config = await this.driver.configManager.lookupDevice(
          message.manufacturerId,
          message.productType,
          message.productId,
          message.firmwareVersion,
        );
        return { config };
      }
      case ConfigManagerCommand.loadManufacturers: {
        await this.driver.configManager.loadManufacturers();
        return {};
      }
      case ConfigManagerCommand.lookupManufacturer: {
        const name = this.driver.configManager.lookupManufacturer(
          message.manufacturerId,
        );
        return { name };
      }
      case ConfigManagerCommand.loadDeviceIndex: {
        await this.driver.configManager.loadDeviceIndex();
        return {};
      }
      case ConfigManagerCommand.getIndex: {
        const index = this.driver.configManager.getIndex();
        return { index };
      }
      case ConfigManagerCommand.loadFulltextDeviceIndex: {
        await this.driver.configManager.loadFulltextDeviceIndex();
        return {};
      }
      case ConfigManagerCommand.getFulltextIndex: {
        const index = this.driver.configManager.getFulltextIndex();
        return { index };
      }
      case ConfigManagerCommand.lookupDevicePreserveConditions: {
        const config =
          await this.driver.configManager.lookupDevicePreserveConditions(
            message.manufacturerId,
            message.productType,
            message.productId,
            message.firmwareVersion,
          );
        return { config };
      }
      case ConfigManagerCommand.manufacturers: {
        const manufacturers = this.driver.configManager.manufacturers;
        return { manufacturers };
      }
      case ConfigManagerCommand.loadAll: {
        await this.driver.configManager.loadAll();
        return {};
      }
      case ConfigManagerCommand.configVersion: {
        return { configVersion: this.driver.configManager.configVersion };
      }
      default: {
        throw new UnknownCommandError(command);
      }
    }
  }
}

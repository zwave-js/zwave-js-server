import { Driver } from "zwave-js";
import { UnknownCommandError } from "../error";
import { Client } from "../server";
import { DriverCommand } from "./command";
import { IncomingMessageDriver } from "./incoming_message";
import { DriverResultTypes } from "./outgoing_message";
import { numberFromLogLevel } from "../../util/logger";

export class DriverMessageHandler {
  static async handle(
    message: IncomingMessageDriver,
    driver: Driver,
    client: Client
  ): Promise<DriverResultTypes[DriverCommand]> {
    const { command } = message;

    switch (message.command) {
      case DriverCommand.disableStatistics:
        driver.disableStatistics();
        return {};
      case DriverCommand.enableStatistics:
        driver.enableStatistics({
          applicationName: message.applicationName,
          applicationVersion: message.applicationVersion,
        });
        return {};
      case DriverCommand.getLogConfig:
        const { transports, ...partialLogConfig } = driver.getLogConfig();

        if (
          client.schemaVersion < 3 &&
          typeof partialLogConfig.level === "string"
        ) {
          let levelNum = numberFromLogLevel(partialLogConfig.level);
          if (levelNum != undefined) {
            partialLogConfig.level = levelNum;
          }
        }
        return { config: partialLogConfig };
      case DriverCommand.updateLogConfig:
        driver.updateLogConfig(message.config);
        return {};
      default:
        throw new UnknownCommandError(command);
    }
  }
}

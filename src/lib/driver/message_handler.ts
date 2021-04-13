import { Driver } from "zwave-js";
import { UnknownCommandError } from "../error";
import { Client } from "../server";
import { DriverCommand } from "./command";
import { IncomingMessageDriver } from "./incoming_message";
import { DriverResultTypes } from "./outgoing_message";
import { dumpDriver, dumpLogConfig } from "../state";

export class DriverMessageHandler {
  static async handle(
    message: IncomingMessageDriver,
    driver: Driver,
    client: Client
  ): Promise<DriverResultTypes[DriverCommand]> {
    const { command } = message;
    switch (message.command) {
      case DriverCommand.getConfig:
        return { config: dumpDriver(driver, client.schemaVersion) };
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
        return { config: dumpLogConfig(driver, client.schemaVersion) };
      case DriverCommand.updateLogConfig:
        driver.updateLogConfig(message.config);
        return {};
      case DriverCommand.isStatisticsEnabled:
        return { statisticsEnabled: driver.statisticsEnabled };
      default:
        throw new UnknownCommandError(command);
    }
  }
}

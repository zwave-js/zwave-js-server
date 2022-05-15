import { Driver } from "zwave-js";
import { UnknownCommandError } from "../error";
import { Client, ClientsController } from "../server";
import { DriverCommand } from "./command";
import { IncomingMessageDriver } from "./incoming_message";
import { DriverResultTypes } from "./outgoing_message";
import { dumpDriver, dumpLogConfig } from "../state";

export class DriverMessageHandler {
  static async handle(
    message: IncomingMessageDriver,
    clientsController: ClientsController,
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
        // If the logging event forwarder is enabled, we need to restart
        // it so that it picks up the new config.
        clientsController.restartLoggingEventForwarderIfNeeded();
        clientsController.clients.forEach((cl) => {
          cl.sendEvent({
            source: "driver",
            event: "log config updated",
            config: dumpLogConfig(driver, cl.schemaVersion),
          });
        });
        return {};
      case DriverCommand.isStatisticsEnabled:
        return { statisticsEnabled: driver.statisticsEnabled };
      case DriverCommand.startListeningLogs:
        client.receiveLogs = true;
        clientsController.configureLoggingEventForwarder(message.filter);
        return {};
      case DriverCommand.stopListeningLogs:
        client.receiveLogs = false;
        clientsController.cleanupLoggingEventForwarder();
        return {};
      case DriverCommand.checkForConfigUpdates:
        const installedVersion = driver.configVersion;
        const newVersion = await driver.checkForConfigUpdates();
        const updateAvailable = newVersion !== undefined;
        return { installedVersion, updateAvailable, newVersion };
      case DriverCommand.installConfigUpdate:
        const success = await driver.installConfigUpdate();
        return { success };
      case DriverCommand.setPreferredScales:
        driver.setPreferredScales(message.scales);
        return {};
      case DriverCommand.enableErrorReporting:
        driver.enableErrorReporting();
        return {};
      default:
        throw new UnknownCommandError(command);
    }
  }
}

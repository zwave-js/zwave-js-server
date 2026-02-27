import { Driver, extractFirmware, OTWFirmwareUpdateResult } from "zwave-js";
import { UnknownCommandError } from "../error.js";
import { parseFirmwareFile } from "../common.js";
import {
  Client,
  ClientsController,
  Logger,
  ZwavejsServerRemoteController,
} from "../server.js";
import { DriverCommand } from "./command.js";
import { IncomingMessageDriver } from "./incoming_message.js";
import { DriverResultTypes } from "./outgoing_message.js";
import { dumpDriver, dumpLogConfig } from "../state.js";
import { MessageHandler } from "../message_handler.js";

export class DriverMessageHandler implements MessageHandler {
  constructor(
    private remoteController: ZwavejsServerRemoteController,
    private clientsController: ClientsController,
    private logger: Logger,
    private driver: Driver,
    private client: Client,
  ) {}

  async handle(
    message: IncomingMessageDriver,
  ): Promise<DriverResultTypes[DriverCommand]> {
    const { command } = message;
    switch (message.command) {
      case DriverCommand.getConfig: {
        const config = dumpDriver(this.driver, this.client.schemaVersion);
        return { config };
      }
      case DriverCommand.disableStatistics: {
        this.driver.disableStatistics();
        return {};
      }
      case DriverCommand.enableStatistics: {
        this.driver.enableStatistics({
          applicationName: message.applicationName,
          applicationVersion: message.applicationVersion,
        });
        return {};
      }
      case DriverCommand.getLogConfig: {
        const config = dumpLogConfig(this.driver, this.client.schemaVersion);
        return { config };
      }
      case DriverCommand.updateLogConfig: {
        this.driver.updateLogConfig(message.config);
        // If the logging event forwarder is enabled, we need to restart
        // it so that it picks up the new config.
        this.clientsController.restartLoggingEventForwarderIfNeeded();
        this.clientsController.clients.forEach((cl) => {
          cl.sendEvent({
            source: "driver",
            event: "log config updated",
            config: dumpLogConfig(this.driver, cl.schemaVersion),
          });
        });
        return {};
      }
      case DriverCommand.isStatisticsEnabled: {
        const statisticsEnabled = this.driver.statisticsEnabled;
        return { statisticsEnabled };
      }
      case DriverCommand.startListeningLogs: {
        this.client.receiveLogs = true;
        this.clientsController.configureLoggingEventForwarder(message.filter);
        return {};
      }
      case DriverCommand.stopListeningLogs: {
        this.client.receiveLogs = false;
        this.clientsController.cleanupLoggingEventForwarder();
        return {};
      }
      case DriverCommand.checkForConfigUpdates: {
        const installedVersion = this.driver.configVersion;
        const newVersion = await this.driver.checkForConfigUpdates();
        const updateAvailable = newVersion !== undefined;
        return { installedVersion, updateAvailable, newVersion };
      }
      case DriverCommand.installConfigUpdate: {
        const success = await this.driver.installConfigUpdate();
        return { success };
      }
      case DriverCommand.setPreferredScales: {
        this.driver.setPreferredScales(message.scales);
        return {};
      }
      case DriverCommand.enableErrorReporting: {
        // This capability no longer exists but we keep the command here for backwards
        // compatibility.
        this.logger.warn(
          "Z-Wave JS no longer supports enabling error reporting. If you are using " +
            "an application that integrates with Z-Wave JS and you receive this " +
            "error, you may need to update the application.",
        );
        return {};
      }
      case DriverCommand.softReset: {
        await this.driver.softReset();
        return {};
      }
      case DriverCommand.trySoftReset: {
        await this.driver.trySoftReset();
        return {};
      }
      case DriverCommand.hardReset: {
        setTimeout(() => this.remoteController.hardResetController(), 1);
        return {};
      }
      case DriverCommand.shutdown: {
        const success = await this.driver.shutdown();
        return { success };
      }
      case DriverCommand.updateOptions: {
        this.driver.updateOptions(message.options);
        return {};
      }
      case DriverCommand.sendTestFrame: {
        const status = await this.driver.sendTestFrame(
          message.nodeId,
          message.powerlevel,
        );
        return { status };
      }
      case DriverCommand.firmwareUpdateOTW: {
        let result: OTWFirmwareUpdateResult;
        if ("updateInfo" in message) {
          // The update info from the Z-Wave JS update service can be passed directly to the driver
          result = await this.driver.firmwareUpdateOTW(message.updateInfo);
        } else {
          const file = Buffer.from(message.file, "base64");
          const parsed = parseFirmwareFile(
            message.filename,
            file,
            message.fileFormat,
          );
          const { data } = await extractFirmware(parsed.rawData, parsed.format);
          result = await this.driver.firmwareUpdateOTW(data);
        }
        return { result };
      }
      case DriverCommand.isOTWFirmwareUpdateInProgress: {
        const progress = this.driver.isOTWFirmwareUpdateInProgress();
        return { progress };
      }
      // Bootloader operations
      case DriverCommand.softResetAndRestart: {
        await this.driver.softResetAndRestart();
        return {};
      }
      case DriverCommand.enterBootloader: {
        await this.driver.enterBootloader();
        return {};
      }
      case DriverCommand.leaveBootloader: {
        await this.driver.leaveBootloader();
        return {};
      }
      // CC version queries
      case DriverCommand.getSupportedCCVersion: {
        const version = this.driver.getSupportedCCVersion(
          message.cc,
          message.nodeId,
          message.endpointIndex,
        );
        return { version };
      }
      case DriverCommand.getSafeCCVersion: {
        const version = this.driver.getSafeCCVersion(
          message.cc,
          message.nodeId,
          message.endpointIndex,
        );
        return { version };
      }
      // User agent
      case DriverCommand.updateUserAgent: {
        this.driver.updateUserAgent(message.components);
        return {};
      }
      // RSSI monitoring
      case DriverCommand.enableFrequentRSSIMonitoring: {
        this.driver.enableFrequentRSSIMonitoring(message.durationMs);
        return {};
      }
      case DriverCommand.disableFrequentRSSIMonitoring: {
        this.driver.disableFrequentRSSIMonitoring();
        return {};
      }
      default: {
        throw new UnknownCommandError(command);
      }
    }
  }
}

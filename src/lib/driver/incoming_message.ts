import { FirmwareFileFormat, LogConfig } from "@zwave-js/core";
import { DriverCommand } from "./command.js";
import { IncomingCommandBase } from "../incoming_message_base.js";
import { EditableZWaveOptions, Powerlevel, ZWaveOptions } from "zwave-js";
import { LogContexts } from "../logging.js";

interface IncomingCommandGetConfig extends IncomingCommandBase {
  command: DriverCommand.getConfig;
}

interface IncomingCommandUpdateLogConfig extends IncomingCommandBase {
  command: DriverCommand.updateLogConfig;
  config: Partial<LogConfig>;
}

interface IncomingCommandGetLogConfig extends IncomingCommandBase {
  command: DriverCommand.getLogConfig;
}

interface IncomingCommandEnableStatistics extends IncomingCommandBase {
  command: DriverCommand.enableStatistics;
  applicationName: string;
  applicationVersion: string;
}

interface IncomingCommandDisableStatistics extends IncomingCommandBase {
  command: DriverCommand.disableStatistics;
}

interface IncomingCommandIsStatisticsEnabled extends IncomingCommandBase {
  command: DriverCommand.isStatisticsEnabled;
}

interface IncomingCommandStartListeningLogs extends IncomingCommandBase {
  command: DriverCommand.startListeningLogs;
  filter?: Partial<LogContexts>;
}

interface IncomingCommandStopListeningLogs extends IncomingCommandBase {
  command: DriverCommand.stopListeningLogs;
}

interface IncomingCommandCheckForConfigUpdates extends IncomingCommandBase {
  command: DriverCommand.checkForConfigUpdates;
}

interface IncomingCommandInstallConfigUpdate extends IncomingCommandBase {
  command: DriverCommand.installConfigUpdate;
}

interface IncomingCommandSetPreferredScales extends IncomingCommandBase {
  command: DriverCommand.setPreferredScales;
  scales: ZWaveOptions["preferences"]["scales"];
}

interface IncomingCommandEnableErrorReporting extends IncomingCommandBase {
  command: DriverCommand.enableErrorReporting;
}

interface IncomingCommandSoftReset extends IncomingCommandBase {
  command: DriverCommand.softReset;
}

interface IncomingCommandTrySoftReset extends IncomingCommandBase {
  command: DriverCommand.trySoftReset;
}

interface IncomingCommandHardReset extends IncomingCommandBase {
  command: DriverCommand.hardReset;
}

interface IncomingCommandShutdown extends IncomingCommandBase {
  command: DriverCommand.shutdown;
}

interface IncomingCommandUpdateOptions extends IncomingCommandBase {
  command: DriverCommand.updateOptions;
  options: EditableZWaveOptions;
}

interface IncomingCommandSendTestFrame extends IncomingCommandBase {
  command: DriverCommand.sendTestFrame;
  nodeId: number;
  powerlevel: Powerlevel;
}

export interface IncomingCommandFirmwareUpdateOTW extends IncomingCommandBase {
  command: DriverCommand.firmwareUpdateOTW;
  filename: string;
  file: string; // use base64 encoding for the file
  fileFormat?: FirmwareFileFormat;
}

export interface IncomingCommandIsOTWFirmwareUpdateInProgress
  extends IncomingCommandBase {
  command: DriverCommand.isOTWFirmwareUpdateInProgress;
}

export type IncomingMessageDriver =
  | IncomingCommandGetConfig
  | IncomingCommandUpdateLogConfig
  | IncomingCommandGetLogConfig
  | IncomingCommandDisableStatistics
  | IncomingCommandEnableStatistics
  | IncomingCommandIsStatisticsEnabled
  | IncomingCommandStartListeningLogs
  | IncomingCommandStopListeningLogs
  | IncomingCommandCheckForConfigUpdates
  | IncomingCommandInstallConfigUpdate
  | IncomingCommandSetPreferredScales
  | IncomingCommandEnableErrorReporting
  | IncomingCommandSoftReset
  | IncomingCommandTrySoftReset
  | IncomingCommandHardReset
  | IncomingCommandShutdown
  | IncomingCommandUpdateOptions
  | IncomingCommandSendTestFrame
  | IncomingCommandFirmwareUpdateOTW
  | IncomingCommandIsOTWFirmwareUpdateInProgress;

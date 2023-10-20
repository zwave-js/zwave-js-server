import { LogConfig } from "@zwave-js/core";
import { DriverCommand } from "./command";
import { IncomingCommandBase } from "../incoming_message_base";
import { EditableZWaveOptions, ZWaveOptions } from "zwave-js";
import { LogContexts } from "../logging";

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
  | IncomingCommandUpdateOptions;

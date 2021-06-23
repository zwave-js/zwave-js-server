import { LogConfig } from "@zwave-js/core";
import { DriverCommand } from "./command";
import { IncomingCommandBase } from "../incoming_message_base";
import { ZWaveOptions } from "zwave-js";

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
  | IncomingCommandSetPreferredScales;

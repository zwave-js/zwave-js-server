import { LogConfig } from "@zwave-js/core";
import { DriverCommand } from "./command";
import { IncomingCommandBase } from "../incoming_message_base";

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

export type IncomingMessageDriver =
  | IncomingCommandUpdateLogConfig
  | IncomingCommandGetLogConfig
  | IncomingCommandDisableStatistics
  | IncomingCommandEnableStatistics;

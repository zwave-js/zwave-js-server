import { LogConfig } from "@zwave-js/core";
import { DriverState } from "../state";
import { DriverCommand } from "./command";

export interface DriverResultTypes {
  [DriverCommand.getConfig]: DriverState;
  [DriverCommand.updateLogConfig]: Record<string, never>;
  [DriverCommand.getLogConfig]: { config: Partial<LogConfig> };
  [DriverCommand.disableStatistics]: Record<string, never>;
  [DriverCommand.enableStatistics]: Record<string, never>;
  [DriverCommand.statisticsEnabled]: { statisticsEnabled: boolean };
}

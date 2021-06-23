import { LogConfig } from "@zwave-js/core";
import { DriverState } from "../state";
import { DriverCommand } from "./command";

export interface DriverResultTypes {
  [DriverCommand.getConfig]: { config: DriverState };
  [DriverCommand.updateLogConfig]: Record<string, never>;
  [DriverCommand.getLogConfig]: { config: Partial<LogConfig> };
  [DriverCommand.disableStatistics]: Record<string, never>;
  [DriverCommand.enableStatistics]: Record<string, never>;
  [DriverCommand.isStatisticsEnabled]: { statisticsEnabled: boolean };
  [DriverCommand.startListeningLogs]: Record<string, never>;
  [DriverCommand.stopListeningLogs]: Record<string, never>;
  [DriverCommand.checkForConfigUpdates]: {
    updateAvailable: boolean;
    newVersion?: string;
  };
  [DriverCommand.installConfigUpdate]: { success: boolean };
  [DriverCommand.setPreferredScales]: Record<string, never>;
}

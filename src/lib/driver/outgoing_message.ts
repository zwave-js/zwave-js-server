import { LogConfig, TransmitStatus } from "@zwave-js/core";
import { DriverState } from "../state.js";
import { DriverCommand } from "./command.js";
import { OTWFirmwareUpdateResultType } from "../common.js";

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
    installedVersion: string;
    updateAvailable: boolean;
    newVersion?: string;
  };
  [DriverCommand.installConfigUpdate]: { success: boolean };
  [DriverCommand.setPreferredScales]: Record<string, never>;
  [DriverCommand.enableErrorReporting]: Record<string, never>;
  [DriverCommand.softReset]: Record<string, never>;
  [DriverCommand.trySoftReset]: Record<string, never>;
  [DriverCommand.hardReset]: Record<string, never>;
  [DriverCommand.shutdown]: { success: boolean };
  [DriverCommand.updateOptions]: Record<string, never>;
  [DriverCommand.sendTestFrame]: { status?: TransmitStatus };
  [DriverCommand.firmwareUpdateOTW]: OTWFirmwareUpdateResultType;
  [DriverCommand.isOTWFirmwareUpdateInProgress]: { progress: boolean };
  // Bootloader operations
  [DriverCommand.softResetAndRestart]: Record<string, never>;
  [DriverCommand.enterBootloader]: Record<string, never>;
  [DriverCommand.leaveBootloader]: Record<string, never>;
  // CC version queries
  [DriverCommand.getSupportedCCVersion]: { version: number };
  [DriverCommand.getSafeCCVersion]: { version: number | undefined };
  // User agent
  [DriverCommand.updateUserAgent]: Record<string, never>;
  // RSSI monitoring
  [DriverCommand.enableFrequentRSSIMonitoring]: Record<string, never>;
  [DriverCommand.disableFrequentRSSIMonitoring]: Record<string, never>;
}

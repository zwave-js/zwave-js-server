import { CommandClasses, FirmwareFileFormat, LogConfig } from "@zwave-js/core";
import { DriverCommand } from "./command.js";
import { IncomingCommandBase } from "../incoming_message_base.js";
import {
  type EditableZWaveOptions,
  type FirmwareUpdateInfo,
  Powerlevel,
  type ZWaveOptions,
} from "zwave-js";
import { LogContexts } from "../logging.js";

interface IncomingCommandDriverGetConfig extends IncomingCommandBase {
  command: DriverCommand.getConfig;
}

interface IncomingCommandDriverUpdateLogConfig extends IncomingCommandBase {
  command: DriverCommand.updateLogConfig;
  config: Partial<LogConfig>;
}

interface IncomingCommandDriverGetLogConfig extends IncomingCommandBase {
  command: DriverCommand.getLogConfig;
}

interface IncomingCommandDriverEnableStatistics extends IncomingCommandBase {
  command: DriverCommand.enableStatistics;
  applicationName: string;
  applicationVersion: string;
}

interface IncomingCommandDriverDisableStatistics extends IncomingCommandBase {
  command: DriverCommand.disableStatistics;
}

interface IncomingCommandDriverIsStatisticsEnabled extends IncomingCommandBase {
  command: DriverCommand.isStatisticsEnabled;
}

interface IncomingCommandDriverStartListeningLogs extends IncomingCommandBase {
  command: DriverCommand.startListeningLogs;
  filter?: Partial<LogContexts>;
}

interface IncomingCommandDriverStopListeningLogs extends IncomingCommandBase {
  command: DriverCommand.stopListeningLogs;
}

interface IncomingCommandDriverCheckForConfigUpdates extends IncomingCommandBase {
  command: DriverCommand.checkForConfigUpdates;
}

interface IncomingCommandDriverInstallConfigUpdate extends IncomingCommandBase {
  command: DriverCommand.installConfigUpdate;
}

interface IncomingCommandDriverSetPreferredScales extends IncomingCommandBase {
  command: DriverCommand.setPreferredScales;
  scales: ZWaveOptions["preferences"]["scales"];
}

interface IncomingCommandDriverEnableErrorReporting extends IncomingCommandBase {
  command: DriverCommand.enableErrorReporting;
}

interface IncomingCommandDriverSoftReset extends IncomingCommandBase {
  command: DriverCommand.softReset;
}

interface IncomingCommandDriverTrySoftReset extends IncomingCommandBase {
  command: DriverCommand.trySoftReset;
}

interface IncomingCommandDriverHardReset extends IncomingCommandBase {
  command: DriverCommand.hardReset;
}

interface IncomingCommandDriverShutdown extends IncomingCommandBase {
  command: DriverCommand.shutdown;
}

interface IncomingCommandDriverUpdateOptions extends IncomingCommandBase {
  command: DriverCommand.updateOptions;
  options: EditableZWaveOptions;
}

interface IncomingCommandDriverSendTestFrame extends IncomingCommandBase {
  command: DriverCommand.sendTestFrame;
  nodeId: number;
  powerlevel: Powerlevel;
}

export type IncomingCommandDriverFirmwareUpdateOTW = IncomingCommandBase & {
  command: DriverCommand.firmwareUpdateOTW;
} & (
    | {
        // The firmware update can either be passed as a "raw" file
        filename: string;
        file: string; // use base64 encoding for the file
        fileFormat?: FirmwareFileFormat;
      }
    | {
        // Or as the update info received from the Z-Wave JS update service
        // (only schema version >= 44)
        updateInfo: FirmwareUpdateInfo;
      }
  );

export interface IncomingCommandDriverIsOTWFirmwareUpdateInProgress extends IncomingCommandBase {
  command: DriverCommand.isOTWFirmwareUpdateInProgress;
}

interface IncomingCommandDriverSoftResetAndRestart extends IncomingCommandBase {
  command: DriverCommand.softResetAndRestart;
}

interface IncomingCommandDriverEnterBootloader extends IncomingCommandBase {
  command: DriverCommand.enterBootloader;
}

interface IncomingCommandDriverLeaveBootloader extends IncomingCommandBase {
  command: DriverCommand.leaveBootloader;
}

// CC version queries
interface IncomingCommandDriverGetSupportedCCVersion extends IncomingCommandBase {
  command: DriverCommand.getSupportedCCVersion;
  cc: CommandClasses;
  nodeId: number;
  endpointIndex?: number;
}

interface IncomingCommandDriverGetSafeCCVersion extends IncomingCommandBase {
  command: DriverCommand.getSafeCCVersion;
  cc: CommandClasses;
  nodeId: number;
  endpointIndex?: number;
}

// User agent
interface IncomingCommandDriverUpdateUserAgent extends IncomingCommandBase {
  command: DriverCommand.updateUserAgent;
  components: Record<string, string | null | undefined>;
}

// RSSI monitoring
interface IncomingCommandDriverEnableFrequentRSSIMonitoring extends IncomingCommandBase {
  command: DriverCommand.enableFrequentRSSIMonitoring;
  durationMs: number;
}

interface IncomingCommandDriverDisableFrequentRSSIMonitoring extends IncomingCommandBase {
  command: DriverCommand.disableFrequentRSSIMonitoring;
}

export type IncomingMessageDriver =
  | IncomingCommandDriverGetConfig
  | IncomingCommandDriverUpdateLogConfig
  | IncomingCommandDriverGetLogConfig
  | IncomingCommandDriverDisableStatistics
  | IncomingCommandDriverEnableStatistics
  | IncomingCommandDriverIsStatisticsEnabled
  | IncomingCommandDriverStartListeningLogs
  | IncomingCommandDriverStopListeningLogs
  | IncomingCommandDriverCheckForConfigUpdates
  | IncomingCommandDriverInstallConfigUpdate
  | IncomingCommandDriverSetPreferredScales
  | IncomingCommandDriverEnableErrorReporting
  | IncomingCommandDriverSoftReset
  | IncomingCommandDriverTrySoftReset
  | IncomingCommandDriverHardReset
  | IncomingCommandDriverShutdown
  | IncomingCommandDriverUpdateOptions
  | IncomingCommandDriverSendTestFrame
  | IncomingCommandDriverFirmwareUpdateOTW
  | IncomingCommandDriverIsOTWFirmwareUpdateInProgress
  | IncomingCommandDriverSoftResetAndRestart
  | IncomingCommandDriverEnterBootloader
  | IncomingCommandDriverLeaveBootloader
  | IncomingCommandDriverGetSupportedCCVersion
  | IncomingCommandDriverGetSafeCCVersion
  | IncomingCommandDriverUpdateUserAgent
  | IncomingCommandDriverEnableFrequentRSSIMonitoring
  | IncomingCommandDriverDisableFrequentRSSIMonitoring;

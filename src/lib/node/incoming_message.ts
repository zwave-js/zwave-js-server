import {
  Powerlevel,
  RefreshInfoOptions,
  SetValueAPIOptions,
  ValueID,
} from "zwave-js";
import {
  CommandClasses,
  ConfigValue,
  ConfigValueFormat,
  FirmwareFileFormat,
  SecurityClass,
} from "@zwave-js/core";
import { IncomingCommandBase } from "../incoming_message_base";
import { NodeCommand } from "./command";

export interface IncomingCommandNodeBase extends IncomingCommandBase {
  nodeId: number;
}

export interface IncomingCommandNodeSetValue extends IncomingCommandNodeBase {
  command: NodeCommand.setValue;
  valueId: ValueID;
  value: unknown;
  options?: SetValueAPIOptions;
}

export interface IncomingCommandNodeRefreshInfo
  extends IncomingCommandNodeBase {
  command: NodeCommand.refreshInfo;
  options?: RefreshInfoOptions;
}

export interface IncomingCommandNodeGetDefinedValueIDs
  extends IncomingCommandNodeBase {
  command: NodeCommand.getDefinedValueIDs;
}

export interface IncomingCommandNodeGetValueMetadata
  extends IncomingCommandNodeBase {
  command: NodeCommand.getValueMetadata;
  valueId: ValueID;
}

// Schema <= 23
export interface IncomingCommandNodeBeginFirmwareUpdate
  extends IncomingCommandNodeBase {
  command: NodeCommand.beginFirmwareUpdate;
  firmwareFilename: string;
  firmwareFile: string; // use base64 encoding for the file
  firmwareFileFormat?: FirmwareFileFormat;
  target?: number;
}

// Schema > 23
export interface IncomingCommandNodeUpdateFirmware
  extends IncomingCommandNodeBase {
  command: NodeCommand.updateFirmware;
  updates: {
    filename: string;
    file: string; // use base64 encoding for the file
    fileFormat?: FirmwareFileFormat;
    firmwareTarget?: number;
  }[];
}

export interface IncomingCommandNodeAbortFirmwareUpdate
  extends IncomingCommandNodeBase {
  command: NodeCommand.abortFirmwareUpdate;
}

export interface IncomingCommandGetFirmwareUpdateCapabilities
  extends IncomingCommandNodeBase {
  command: NodeCommand.getFirmwareUpdateCapabilities;
}

export interface IncomingCommandGetFirmwareUpdateCapabilitiesCached
  extends IncomingCommandNodeBase {
  command: NodeCommand.getFirmwareUpdateCapabilitiesCached;
}

export interface IncomingCommandNodePollValue extends IncomingCommandNodeBase {
  command: NodeCommand.pollValue;
  valueId: ValueID;
}

export interface IncomingCommandNodeSetRawConfigParameterValue
  extends IncomingCommandNodeBase {
  command: NodeCommand.setRawConfigParameterValue;
  parameter: number;
  bitMask?: number;
  value: ConfigValue;
  valueSize?: 1 | 2 | 4; // valueSize and valueFormat should be used together.
  valueFormat?: ConfigValueFormat;
}

export interface IncomingCommandNodeRefreshValues
  extends IncomingCommandNodeBase {
  command: NodeCommand.refreshValues;
}

export interface IncomingCommandNodeRefreshCCValues
  extends IncomingCommandNodeBase {
  command: NodeCommand.refreshCCValues;
  commandClass: CommandClasses;
}

export interface IncomingCommandNodePing extends IncomingCommandNodeBase {
  command: NodeCommand.ping;
}

export interface IncomingCommandHasSecurityClass
  extends IncomingCommandNodeBase {
  command: NodeCommand.hasSecurityClass;
  securityClass: SecurityClass;
}

export interface IncomingCommandGetHighestSecurityClass
  extends IncomingCommandNodeBase {
  command: NodeCommand.getHighestSecurityClass;
}

export interface IncomingCommandTestPowerlevel extends IncomingCommandNodeBase {
  command: NodeCommand.testPowerlevel;
  testNodeId: number;
  powerlevel: Powerlevel;
  testFrameCount: number;
}

export interface IncomingCommandCheckLifelineHealth
  extends IncomingCommandNodeBase {
  command: NodeCommand.checkLifelineHealth;
  rounds?: number;
}

export interface IncomingCommandCheckRouteHealth
  extends IncomingCommandNodeBase {
  command: NodeCommand.checkRouteHealth;
  targetNodeId: number;
  rounds?: number;
}

export interface IncomingCommandGetValue extends IncomingCommandNodeBase {
  command: NodeCommand.getValue;
  valueId: ValueID;
}

export interface IncomingCommandGetEndpointCount
  extends IncomingCommandNodeBase {
  command: NodeCommand.getEndpointCount;
}

export interface IncomingCommandInterviewCC extends IncomingCommandNodeBase {
  command: NodeCommand.interviewCC;
  commandClass: CommandClasses;
}

export interface IncomingCommandGetState extends IncomingCommandNodeBase {
  command: NodeCommand.getState;
}

export interface IncomingCommandSetName extends IncomingCommandNodeBase {
  command: NodeCommand.setName;
  name: string;
  updateCC?: boolean;
}

export interface IncomingCommandSetLocation extends IncomingCommandNodeBase {
  command: NodeCommand.setLocation;
  location: string;
  updateCC?: boolean;
}

export interface IncomingCommandSetKeepAwake extends IncomingCommandNodeBase {
  command: NodeCommand.setKeepAwake;
  keepAwake: boolean;
}

export interface IncomingCommandIsFirmwareUpdateInProgress
  extends IncomingCommandNodeBase {
  command:
    | NodeCommand.isFirmwareUpdateInProgress
    | NodeCommand.getFirmwareUpdateProgress;
}

export interface IncomingCommandWaitForWakeup extends IncomingCommandNodeBase {
  command: NodeCommand.waitForWakeup;
}

export interface IncomingCommandInterview extends IncomingCommandNodeBase {
  command: NodeCommand.interview;
}

export interface IncomingCommandNodeGetValueTimestamp
  extends IncomingCommandNodeBase {
  command: NodeCommand.getValueTimestamp;
  valueId: ValueID;
}

export interface IncomingCommandNodeManuallyIdleNotificationValue
  extends IncomingCommandNodeBase {
  command: NodeCommand.manuallyIdleNotificationValue;
  valueId: ValueID;
}

export interface IncomingCommandNodeSetDateAndTime
  extends IncomingCommandNodeBase {
  command: NodeCommand.setDateAndTime;
  date?: string; // use ISO 8601 date string format
}

export interface IncomingCommandNodeGetDateAndTime
  extends IncomingCommandNodeBase {
  command: NodeCommand.getDateAndTime;
}

export interface IncomingCommandNodeIsHealthCheckInProgress
  extends IncomingCommandNodeBase {
  command: NodeCommand.isHealthCheckInProgress;
}

export interface IncomingCommandNodeAbortHealthCheck
  extends IncomingCommandNodeBase {
  command: NodeCommand.abortHealthCheck;
}

export interface IncomingCommandNodeSetDefaultVolume
  extends IncomingCommandNodeBase {
  command: NodeCommand.setDefaultVolume;
  defaultVolume?: number;
}

export interface IncomingCommandNodeSetDefaultTransitionDuration
  extends IncomingCommandNodeBase {
  command: NodeCommand.setDefaultTransitionDuration;
  defaultTransitionDuration?: string; // Will be converted to a Duration object
}

export interface IncomingCommandNodeHasDeviceConfigChanged
  extends IncomingCommandNodeBase {
  command: NodeCommand.hasDeviceConfigChanged;
}

export type IncomingMessageNode =
  | IncomingCommandNodeSetValue
  | IncomingCommandNodeRefreshInfo
  | IncomingCommandNodeGetDefinedValueIDs
  | IncomingCommandNodeGetValueMetadata
  | IncomingCommandNodeBeginFirmwareUpdate
  | IncomingCommandNodeUpdateFirmware
  | IncomingCommandNodeAbortFirmwareUpdate
  | IncomingCommandGetFirmwareUpdateCapabilities
  | IncomingCommandGetFirmwareUpdateCapabilitiesCached
  | IncomingCommandNodePollValue
  | IncomingCommandNodeSetRawConfigParameterValue
  | IncomingCommandNodeRefreshValues
  | IncomingCommandNodeRefreshCCValues
  | IncomingCommandNodePing
  | IncomingCommandHasSecurityClass
  | IncomingCommandGetHighestSecurityClass
  | IncomingCommandTestPowerlevel
  | IncomingCommandCheckLifelineHealth
  | IncomingCommandCheckRouteHealth
  | IncomingCommandGetValue
  | IncomingCommandGetEndpointCount
  | IncomingCommandInterviewCC
  | IncomingCommandGetState
  | IncomingCommandSetName
  | IncomingCommandSetLocation
  | IncomingCommandSetKeepAwake
  | IncomingCommandIsFirmwareUpdateInProgress
  | IncomingCommandWaitForWakeup
  | IncomingCommandInterview
  | IncomingCommandNodeGetValueTimestamp
  | IncomingCommandNodeManuallyIdleNotificationValue
  | IncomingCommandNodeSetDateAndTime
  | IncomingCommandNodeGetDateAndTime
  | IncomingCommandNodeIsHealthCheckInProgress
  | IncomingCommandNodeAbortHealthCheck
  | IncomingCommandNodeSetDefaultVolume
  | IncomingCommandNodeSetDefaultTransitionDuration
  | IncomingCommandNodeHasDeviceConfigChanged;

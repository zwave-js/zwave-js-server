import { ConfigValue, SetValueAPIOptions, ValueID } from "zwave-js";
import { CommandClasses, FirmwareFileFormat } from "@zwave-js/core";
import { IncomingCommandBase } from "../incoming_message_base";
import { NodeCommand } from "./command";

export interface IncomingCommandNodeBase extends IncomingCommandBase {
  nodeId: number;
}

export interface IncomingCommandEndpointBase extends IncomingCommandNodeBase {
  endpoint?: number;
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

export interface IncomingCommandNodeBeginFirmwareUpdate
  extends IncomingCommandNodeBase {
  command: NodeCommand.beginFirmwareUpdate;
  firmwareFilename: string;
  firmwareFile: string; // use base64 encoding for the file
  firmwareFileFormat?: FirmwareFileFormat;
}

export interface IncomingCommandNodeAbortFirmwareUpdate
  extends IncomingCommandNodeBase {
  command: NodeCommand.abortFirmwareUpdate;
}

export interface IncomingCommandNodePollValue extends IncomingCommandNodeBase {
  command: NodeCommand.pollValue;
  valueId: ValueID;
}

export interface IncomingCommandNodeSetRawConfigParameterValue
  extends IncomingCommandNodeBase {
  command: NodeCommand.setRawConfigParameterValue;
  parameter: number;
  value: ConfigValue;
  valueSize: 1 | 2 | 4;
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

export interface IncomingCommandEndpointSupportsCCAPI
  extends IncomingCommandEndpointBase {
  command: NodeCommand.supportsCCAPI;
  commandClass: CommandClasses;
}

export interface IncomingCommandEndpointInvokeCCAPI
  extends IncomingCommandEndpointBase {
  command: NodeCommand.invokeCCAPI;
  commandClass: CommandClasses;
  method: string;
  args: unknown[];
}

export type IncomingMessageNode =
  | IncomingCommandNodeSetValue
  | IncomingCommandNodeRefreshInfo
  | IncomingCommandNodeGetDefinedValueIDs
  | IncomingCommandNodeGetValueMetadata
  | IncomingCommandNodeBeginFirmwareUpdate
  | IncomingCommandNodeAbortFirmwareUpdate
  | IncomingCommandNodePollValue
  | IncomingCommandNodeSetRawConfigParameterValue
  | IncomingCommandNodeRefreshValues
  | IncomingCommandNodeRefreshCCValues
  | IncomingCommandNodePing
  | IncomingCommandEndpointSupportsCCAPI
  | IncomingCommandEndpointInvokeCCAPI;

import { ValueID } from "zwave-js";
import { IncomingCommandBase } from "../incoming_message_base";
import { NodeCommand } from "./command";

export interface IncomingCommandNodeBase extends IncomingCommandBase {
  nodeId: number;
}

export interface IncomingCommandNodeSetValue extends IncomingCommandNodeBase {
  command: NodeCommand.setValue;
  valueId: ValueID;
  value: unknown;
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
export interface IncomingCommandNodeAbortFirmwareUpdate
  extends IncomingCommandNodeBase {
  command: NodeCommand.abortFirmwareUpdate;
}

export interface IncomingCommandNodePollValue extends IncomingCommandNodeBase {
  command: NodeCommand.pollValue;
  valueId: ValueID;
}

export type IncomingMessageNode =
  | IncomingCommandNodeSetValue
  | IncomingCommandNodeRefreshInfo
  | IncomingCommandNodeGetDefinedValueIDs
  | IncomingCommandNodeGetValueMetadata
  | IncomingCommandNodeAbortFirmwareUpdate
  | IncomingCommandNodePollValue;

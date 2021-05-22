import { ValueID } from "zwave-js";
import { IncomingCommandBase } from "../incoming_message_base";
import { VirtualNodeCommand } from "./command";

export interface IncomingCommandVirtualNodeBase extends IncomingCommandBase {
  broadcast?: boolean;
  nodeIDs?: number[];
}

export interface IncomingCommandVirtualNodeSetValue
  extends IncomingCommandVirtualNodeBase {
  command: VirtualNodeCommand.setValue;
  valueId: ValueID;
  value: unknown;
}

export interface IncomingCommandVirtualNodeGetEndpointCount
  extends IncomingCommandVirtualNodeBase {
  command: VirtualNodeCommand.getEndpointCount;
}

export type IncomingMessageVirtualNode =
  | IncomingCommandVirtualNodeSetValue
  | IncomingCommandVirtualNodeGetEndpointCount;

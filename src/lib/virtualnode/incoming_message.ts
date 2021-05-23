import { ValueID } from "zwave-js";
import { IncomingCommandBase } from "../incoming_message_base";
import { VirtualNodeCommand } from "./command";

export interface IncomingCommandVirtualNodeBase extends IncomingCommandBase {}

export interface IncomingCommandVirtualNodeSetValueBroadcast
  extends IncomingCommandVirtualNodeBase {
  command: VirtualNodeCommand.setValueBroadcast;
  valueId: ValueID;
  value: unknown;
}

export interface IncomingCommandVirtualNodeSetValueMulticast
  extends IncomingCommandVirtualNodeBase {
  command: VirtualNodeCommand.setValueMulticast;
  nodeIDs: number[];
  valueId: ValueID;
  value: unknown;
}

export interface IncomingCommandVirtualNodeGetEndpointCountBroadcast
  extends IncomingCommandVirtualNodeBase {
  command: VirtualNodeCommand.getEndpointCountBroadcast;
}

export interface IncomingCommandVirtualNodeGetEndpointCountMulticast
  extends IncomingCommandVirtualNodeBase {
  command: VirtualNodeCommand.getEndpointCountMulticast;
  nodeIDs: number[];
}

export type IncomingMessageVirtualNode =
  | IncomingCommandVirtualNodeSetValueBroadcast
  | IncomingCommandVirtualNodeSetValueMulticast
  | IncomingCommandVirtualNodeGetEndpointCountBroadcast
  | IncomingCommandVirtualNodeGetEndpointCountMulticast;

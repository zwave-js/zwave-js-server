import { ValueID } from "zwave-js";
import { IncomingCommandBase } from "../incoming_message_base";
import { VirtualNodeCommand } from "./command";

export interface IncomingCommandVirtualNodeBase extends IncomingCommandBase {}

export interface IncomingCommandVirtualNodeBaseMulticast
  extends IncomingCommandVirtualNodeBase {
  nodeIDs: number[];
}

export interface IncomingCommandVirtualNodeSetValueBroadcast
  extends IncomingCommandVirtualNodeBase {
  command: VirtualNodeCommand.setValueBroadcast;
  valueId: ValueID;
  value: unknown;
}

export interface IncomingCommandVirtualNodeSetValueMulticast
  extends IncomingCommandVirtualNodeBaseMulticast {
  command: VirtualNodeCommand.setValueMulticast;
  valueId: ValueID;
  value: unknown;
}

export interface IncomingCommandVirtualNodeGetEndpointCountBroadcast
  extends IncomingCommandVirtualNodeBase {
  command: VirtualNodeCommand.getEndpointCountBroadcast;
}

export interface IncomingCommandVirtualNodeGetEndpointCountMulticast
  extends IncomingCommandVirtualNodeBaseMulticast {
  command: VirtualNodeCommand.getEndpointCountMulticast;
}

export type IncomingMessageVirtualNode =
  | IncomingCommandVirtualNodeSetValueBroadcast
  | IncomingCommandVirtualNodeSetValueMulticast
  | IncomingCommandVirtualNodeGetEndpointCountBroadcast
  | IncomingCommandVirtualNodeGetEndpointCountMulticast;

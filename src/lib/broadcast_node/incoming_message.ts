import { CommandClasses, ValueID } from "@zwave-js/core";
import { IncomingCommandBase } from "../incoming_message_base";
import { BroadcastNodeCommand } from "./command";

export interface IncomingCommandBroadcastNodeBase extends IncomingCommandBase {
  index: number;
}

export interface IncomingCommandBroadcastNodeSetValue
  extends IncomingCommandBroadcastNodeBase {
  command: BroadcastNodeCommand.setValue;
  valueId: ValueID;
  value: unknown;
}

export interface IncomingCommandBroadcastNodeGetEndpointCount
  extends IncomingCommandBroadcastNodeBase {
  command: BroadcastNodeCommand.getEndpointCount;
}

export interface IncomingCommandBroadcastNodeSupportsCC
  extends IncomingCommandBroadcastNodeBase {
  command: BroadcastNodeCommand.supportsCC;
  commandClass: CommandClasses;
}

export interface IncomingCommandBroadcastNodeGetCCVersion
  extends IncomingCommandBroadcastNodeBase {
  command: BroadcastNodeCommand.getCCVersion;
  commandClass: CommandClasses;
}

export type IncomingMessageBroadcastNode =
  | IncomingCommandBroadcastNodeSetValue
  | IncomingCommandBroadcastNodeGetEndpointCount
  | IncomingCommandBroadcastNodeSupportsCC
  | IncomingCommandBroadcastNodeGetCCVersion;

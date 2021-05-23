import { CommandClasses, ValueID } from "@zwave-js/core";
import { IncomingCommandBase } from "../incoming_message_base";
import { MulticastGroupCommand } from "./command";

export interface IncomingCommandMulticastGroupBase extends IncomingCommandBase {
  index: number;
  nodeIDs: number[];
}

export interface IncomingCommandMulticastGroupSetValue
  extends IncomingCommandMulticastGroupBase {
  command: MulticastGroupCommand.setValue;
  valueId: ValueID;
  value: unknown;
}

export interface IncomingCommandMulticastGroupGetEndpointCount
  extends IncomingCommandMulticastGroupBase {
  command: MulticastGroupCommand.getEndpointCount;
}

export interface IncomingCommandMulticastGroupSupportsCC
  extends IncomingCommandMulticastGroupBase {
  command: MulticastGroupCommand.supportsCC;
  commandClass: CommandClasses;
}

export interface IncomingCommandMulticastGroupGetCCVersion
  extends IncomingCommandMulticastGroupBase {
  command: MulticastGroupCommand.getCCVersion;
  commandClass: CommandClasses;
}

export type IncomingMessageMulticastGroup =
  | IncomingCommandMulticastGroupSetValue
  | IncomingCommandMulticastGroupGetEndpointCount
  | IncomingCommandMulticastGroupSupportsCC
  | IncomingCommandMulticastGroupGetCCVersion;

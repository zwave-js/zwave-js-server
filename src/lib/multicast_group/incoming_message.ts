import { CommandClasses, ValueID } from "@zwave-js/core";
import { SetValueAPIOptions } from "zwave-js";
import { IncomingCommandBase } from "../incoming_message_base";
import { MulticastGroupCommand } from "./command";

export interface IncomingCommandMulticastGroupBase extends IncomingCommandBase {
  nodeIDs: number[];
}

export interface IncomingCommandMulticastGroupSetValue
  extends IncomingCommandMulticastGroupBase {
  command: MulticastGroupCommand.setValue;
  valueId: ValueID;
  value: unknown;
  options?: SetValueAPIOptions;
}

export interface IncomingCommandMulticastGroupGetEndpointCount
  extends IncomingCommandMulticastGroupBase {
  command: MulticastGroupCommand.getEndpointCount;
}

export interface IncomingCommandMulticastGroupSupportsCC
  extends IncomingCommandMulticastGroupBase {
  command: MulticastGroupCommand.supportsCC;
  index: number;
  commandClass: CommandClasses;
}

export interface IncomingCommandMulticastGroupGetCCVersion
  extends IncomingCommandMulticastGroupBase {
  command: MulticastGroupCommand.getCCVersion;
  index: number;
  commandClass: CommandClasses;
}

export interface IncomingCommandMulticastGroupInvokeCCAPI
  extends IncomingCommandMulticastGroupBase {
  command: MulticastGroupCommand.invokeCCAPI;
  index?: number;
  commandClass: CommandClasses;
  methodName: string;
  args: unknown[];
}

export interface IncomingCommandMulticastGroupSupportsCCAPI
  extends IncomingCommandMulticastGroupBase {
  command: MulticastGroupCommand.supportsCCAPI;
  index?: number;
  commandClass: CommandClasses;
}

export interface IncomingCommandBroadcastNodeGetDefinedValueIDs
  extends IncomingCommandMulticastGroupBase {
  command: MulticastGroupCommand.getDefinedValueIDs;
}

export type IncomingMessageMulticastGroup =
  | IncomingCommandMulticastGroupSetValue
  | IncomingCommandMulticastGroupGetEndpointCount
  | IncomingCommandMulticastGroupSupportsCC
  | IncomingCommandMulticastGroupGetCCVersion
  | IncomingCommandMulticastGroupInvokeCCAPI
  | IncomingCommandMulticastGroupSupportsCCAPI
  | IncomingCommandBroadcastNodeGetDefinedValueIDs;

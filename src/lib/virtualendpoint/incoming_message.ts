import { CommandClasses } from "@zwave-js/core";
import { IncomingCommandBase } from "../incoming_message_base";
import { VirtualEndpointCommand } from "./command";

export interface IncomingCommandVirtualEndpointBase
  extends IncomingCommandBase {
  index: number;
}

export interface IncomingCommandVirtualEndpointSupportsCCBroadcast
  extends IncomingCommandVirtualEndpointBase {
  command: VirtualEndpointCommand.supportsCCBroadcast;
  commandClass: CommandClasses;
}

export interface IncomingCommandVirtualEndpointSupportsCCMulticast
  extends IncomingCommandVirtualEndpointBase {
  command: VirtualEndpointCommand.supportsCCMulticast;
  nodeIDs: number[];
  commandClass: CommandClasses;
}

export interface IncomingCommandVirtualEndpointGetCCVersionBroadcast
  extends IncomingCommandVirtualEndpointBase {
  command: VirtualEndpointCommand.getCCVersionBroadcast;
  commandClass: CommandClasses;
}

export interface IncomingCommandVirtualEndpointGetCCVersionMulticast
  extends IncomingCommandVirtualEndpointBase {
  command: VirtualEndpointCommand.getCCVersionMulticast;
  nodeIDs: number[];
  commandClass: CommandClasses;
}

export type IncomingMessageVirtualEndpoint =
  | IncomingCommandVirtualEndpointSupportsCCBroadcast
  | IncomingCommandVirtualEndpointSupportsCCMulticast
  | IncomingCommandVirtualEndpointGetCCVersionBroadcast
  | IncomingCommandVirtualEndpointGetCCVersionMulticast;

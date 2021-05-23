import { CommandClasses } from "@zwave-js/core";
import { IncomingCommandBase } from "../incoming_message_base";
import { VirtualEndpointCommand } from "./command";

export interface IncomingCommandVirtualEndpointBase
  extends IncomingCommandBase {
  index: number;
}

export interface IncomingCommandVirtualEndpointBaseMulticast
  extends IncomingCommandVirtualEndpointBase {
  nodeIDs: number[];
}

export interface IncomingCommandVirtualEndpointSupportsCCBroadcast
  extends IncomingCommandVirtualEndpointBase {
  command: VirtualEndpointCommand.supportsCCBroadcast;
  commandClass: CommandClasses;
}

export interface IncomingCommandVirtualEndpointSupportsCCMulticast
  extends IncomingCommandVirtualEndpointBaseMulticast {
  command: VirtualEndpointCommand.supportsCCMulticast;
  commandClass: CommandClasses;
}

export interface IncomingCommandVirtualEndpointGetCCVersionBroadcast
  extends IncomingCommandVirtualEndpointBase {
  command: VirtualEndpointCommand.getCCVersionBroadcast;
  commandClass: CommandClasses;
}

export interface IncomingCommandVirtualEndpointGetCCVersionMulticast
  extends IncomingCommandVirtualEndpointBaseMulticast {
  command: VirtualEndpointCommand.getCCVersionMulticast;
  commandClass: CommandClasses;
}

export type IncomingMessageVirtualEndpoint =
  | IncomingCommandVirtualEndpointSupportsCCBroadcast
  | IncomingCommandVirtualEndpointSupportsCCMulticast
  | IncomingCommandVirtualEndpointGetCCVersionBroadcast
  | IncomingCommandVirtualEndpointGetCCVersionMulticast;

import { CommandClasses } from "@zwave-js/core";
import { IncomingCommandBase } from "../incoming_message_base";
import { VirtualEndpointCommand } from "./command";

export interface IncomingCommandVirtualEndpointBase
  extends IncomingCommandBase {
  broadcast?: boolean;
  nodeIDs?: number[];
  index: number;
}

export interface IncomingCommandVirtualEndpointSupportsCC
  extends IncomingCommandVirtualEndpointBase {
  command: VirtualEndpointCommand.supportsCC;
  commandClass: CommandClasses;
}

export interface IncomingCommandVirtualEndpointGetCCVersion
  extends IncomingCommandVirtualEndpointBase {
  command: VirtualEndpointCommand.getCCVersion;
  commandClass: CommandClasses;
}

export type IncomingMessageVirtualEndpoint =
  | IncomingCommandVirtualEndpointSupportsCC
  | IncomingCommandVirtualEndpointGetCCVersion;

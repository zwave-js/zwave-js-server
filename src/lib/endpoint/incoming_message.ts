import { CommandClasses } from "@zwave-js/core";
import { IncomingCommandBase } from "../incoming_message_base";
import { EndpointCommand } from "./command";

export interface IncomingCommandEndpointBase extends IncomingCommandBase {
  nodeId: number;
  endpoint?: number;
}

export interface IncomingCommandEndpointSupportsCCAPI
  extends IncomingCommandEndpointBase {
  command: EndpointCommand.supportsCCAPI;
  commandClass: CommandClasses;
}

export interface IncomingCommandEndpointInvokeCCAPI
  extends IncomingCommandEndpointBase {
  command: EndpointCommand.invokeCCAPI;
  commandClass: CommandClasses;
  method: string;
  args: unknown[];
}

export type IncomingMessageEndpoint =
  | IncomingCommandEndpointSupportsCCAPI
  | IncomingCommandEndpointInvokeCCAPI;

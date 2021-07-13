import { CommandClasses } from "@zwave-js/core";
import { IncomingCommandBase } from "../incoming_message_base";
import { EndpointCommand } from "./command";

export interface IncomingCommandEndpointBase extends IncomingCommandBase {
  nodeId: number;
  endpoint?: number;
}

export interface IncomingCommandEndpointInvokeCCAPI
  extends IncomingCommandEndpointBase {
  command: EndpointCommand.invokeCCAPI;
  commandClass: CommandClasses;
  methodName: string;
  args: unknown[];
}

export interface IncomingCommandEndpointSupportsCCAPI
  extends IncomingCommandEndpointBase {
  command: EndpointCommand.supportsCCAPI;
  commandClass: CommandClasses;
}

export type IncomingMessageEndpoint =
  | IncomingCommandEndpointInvokeCCAPI
  | IncomingCommandEndpointSupportsCCAPI;

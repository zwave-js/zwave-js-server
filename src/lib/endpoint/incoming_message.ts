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

export interface IncomingCommandEndpointSupportsCC
  extends IncomingCommandEndpointBase {
  command: EndpointCommand.supportsCC;
  commandClass: CommandClasses;
}

export interface IncomingCommandEndpointControlsCC
  extends IncomingCommandEndpointBase {
  command: EndpointCommand.controlsCC;
  commandClass: CommandClasses;
}

export interface IncomingCommandEndpointIsCCSecure
  extends IncomingCommandEndpointBase {
  command: EndpointCommand.isCCSecure;
  commandClass: CommandClasses;
}

export interface IncomingCommandEndpointGetCCVersion
  extends IncomingCommandEndpointBase {
  command: EndpointCommand.getCCVersion;
  commandClass: CommandClasses;
}

export interface IncomingCommandEndpointGetNodeUnsafe
  extends IncomingCommandEndpointBase {
  command: EndpointCommand.getNodeUnsafe;
}

export type IncomingMessageEndpoint =
  | IncomingCommandEndpointInvokeCCAPI
  | IncomingCommandEndpointSupportsCCAPI
  | IncomingCommandEndpointSupportsCC
  | IncomingCommandEndpointControlsCC
  | IncomingCommandEndpointIsCCSecure
  | IncomingCommandEndpointGetCCVersion
  | IncomingCommandEndpointGetNodeUnsafe;

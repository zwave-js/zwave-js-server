import { SupervisionResult } from "@zwave-js/core";
import { EndpointCommand } from "./command";
import { NodeState } from "../state";

export interface EndpointResultTypes {
  [EndpointCommand.invokeCCAPI]: { response: unknown };
  [EndpointCommand.supportsCCAPI]: { supported: boolean };
  [EndpointCommand.supportsCC]: { supported: boolean };
  [EndpointCommand.controlsCC]: { controlled: boolean };
  [EndpointCommand.isCCSecure]: { secure: boolean };
  [EndpointCommand.getCCVersion]: { version: number };
  [EndpointCommand.getNodeUnsafe]: { node: NodeState | undefined };
  [EndpointCommand.setRawConfigParameterValue]: { result?: SupervisionResult };
}

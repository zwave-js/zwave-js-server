import { SupervisionResult, MaybeNotKnown, ConfigValue } from "@zwave-js/core";
import { EndpointCommand } from "./command.js";
import { NodeState } from "../state.js";

export interface EndpointResultTypes {
  [EndpointCommand.invokeCCAPI]: { response: unknown };
  [EndpointCommand.supportsCCAPI]: { supported: boolean };
  [EndpointCommand.supportsCC]: { supported: boolean };
  [EndpointCommand.controlsCC]: { controlled: boolean };
  [EndpointCommand.isCCSecure]: { secure: boolean };
  [EndpointCommand.getCCVersion]: { version: number };
  [EndpointCommand.getNodeUnsafe]: { node: NodeState | undefined };
  [EndpointCommand.tryGetNode]: { node: NodeState | undefined };
  [EndpointCommand.setRawConfigParameterValue]: { result?: SupervisionResult };
  [EndpointCommand.getRawConfigParameterValue]: {
    value: MaybeNotKnown<ConfigValue>;
  };
}

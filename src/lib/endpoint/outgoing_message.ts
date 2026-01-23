import {
  SupervisionResult,
  MaybeNotKnown,
  ConfigValue,
  CommandClasses,
  CommandClassInfo,
} from "@zwave-js/core";
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
  [EndpointCommand.getCCs]: {
    commandClasses: Partial<Record<CommandClasses, CommandClassInfo>>;
  };
  [EndpointCommand.maySupportBasicCC]: { maySupport: boolean };
  [EndpointCommand.wasCCRemovedViaConfig]: { removed: boolean };
}

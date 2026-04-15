import {
  MaybeNotKnown,
  ConfigValue,
  CommandClasses,
  CommandClassInfo,
  SupervisionResult,
} from "@zwave-js/core";
import { EndpointCommand } from "./command.js";
import { NodeState } from "../state.js";
import { EndpointAccessControlResultTypes } from "./access_control/outgoing_message.js";

export interface EndpointOwnResultTypes {
  [EndpointCommand.invokeCCAPI]: { response: unknown };
  [EndpointCommand.supportsCCAPI]: { supported: boolean };
  [EndpointCommand.supportsCC]: { supported: boolean };
  [EndpointCommand.controlsCC]: { controlled: boolean };
  [EndpointCommand.isCCSecure]: { secure: boolean };
  [EndpointCommand.getCCVersion]: { version: number };
  [EndpointCommand.getNodeUnsafe]: { node?: NodeState };
  [EndpointCommand.tryGetNode]: { node?: NodeState };
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

export type EndpointResultTypes = EndpointOwnResultTypes &
  EndpointAccessControlResultTypes;

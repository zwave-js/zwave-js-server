import {
  SupervisionResult,
  MaybeNotKnown,
  ConfigValue,
  CommandClasses,
  CommandClassInfo,
} from "@zwave-js/core";
import { EndpointCommand } from "./command.js";
import { NodeState } from "../state.js";

// EndpointDump is not exported from zwave-js, so we use unknown for the dump result
// The actual structure matches what createEndpointDump returns

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
    commandClasses: Record<CommandClasses, CommandClassInfo>;
  };
  [EndpointCommand.maySupportBasicCC]: { maySupport: boolean };
  [EndpointCommand.wasCCRemovedViaConfig]: { removed: boolean };
}

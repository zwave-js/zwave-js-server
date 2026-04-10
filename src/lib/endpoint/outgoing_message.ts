import {
  SupervisionResult,
  MaybeNotKnown,
  ConfigValue,
  CommandClasses,
  CommandClassInfo,
} from "@zwave-js/core";
import type {
  CredentialCapabilities,
  CredentialData,
  UserCapabilities,
  UserData,
} from "zwave-js/Node";
import { EndpointCommand } from "./command.js";
import { NodeState } from "../state.js";

export interface EndpointResultTypes {
  [EndpointCommand.invokeCCAPI]: { response: unknown };
  [EndpointCommand.getUserCapabilitiesCached]: {
    capabilities?: UserCapabilities;
  };
  [EndpointCommand.getCredentialCapabilitiesCached]: {
    capabilities?: CredentialCapabilities;
  };
  [EndpointCommand.getUser]: { user?: UserData };
  [EndpointCommand.getUserCached]: { user?: UserData };
  [EndpointCommand.getUsers]: { users: UserData[] };
  [EndpointCommand.getUsersCached]: { users: UserData[] };
  [EndpointCommand.setUser]: { result?: SupervisionResult };
  [EndpointCommand.deleteUser]: { result?: SupervisionResult };
  [EndpointCommand.deleteAllUsers]: { result?: SupervisionResult };
  [EndpointCommand.getCredential]: { credential?: CredentialData };
  [EndpointCommand.getCredentialCached]: { credential?: CredentialData };
  [EndpointCommand.getCredentials]: { credentials: CredentialData[] };
  [EndpointCommand.getCredentialsCached]: { credentials: CredentialData[] };
  [EndpointCommand.setCredential]: { result?: SupervisionResult };
  [EndpointCommand.deleteCredential]: { result?: SupervisionResult };
  [EndpointCommand.startCredentialLearn]: { result?: SupervisionResult };
  [EndpointCommand.cancelCredentialLearn]: { result?: SupervisionResult };
  [EndpointCommand.getAdminCode]: { code?: string };
  [EndpointCommand.setAdminCode]: { result?: SupervisionResult };
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

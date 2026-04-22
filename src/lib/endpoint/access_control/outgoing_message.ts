import { SupervisionResult } from "@zwave-js/core";
import {
  AssignCredentialResult,
  SetCredentialResult,
  SetUserResult,
  type CredentialCapabilities,
  type CredentialData,
  type UserCapabilities,
  type UserData,
} from "zwave-js/Node";
import { EndpointAccessControlCommand } from "./command.js";

export interface EndpointAccessControlResultTypes {
  [EndpointAccessControlCommand.isSupported]: { supported: boolean };
  [EndpointAccessControlCommand.getUserCapabilitiesCached]: {
    capabilities: UserCapabilities;
  };
  [EndpointAccessControlCommand.getCredentialCapabilitiesCached]: {
    capabilities: CredentialCapabilities;
  };
  [EndpointAccessControlCommand.getUser]: { user?: UserData };
  [EndpointAccessControlCommand.getUserCached]: { user?: UserData };
  [EndpointAccessControlCommand.getUsers]: { users: UserData[] };
  [EndpointAccessControlCommand.getUsersCached]: { users: UserData[] };
  [EndpointAccessControlCommand.setUser]: { result: SetUserResult };
  [EndpointAccessControlCommand.deleteUser]: { result: SetUserResult };
  [EndpointAccessControlCommand.deleteAllUsers]: { result: SetUserResult };
  [EndpointAccessControlCommand.getCredential]: { credential?: CredentialData };
  [EndpointAccessControlCommand.getCredentialCached]: {
    credential?: CredentialData;
  };
  [EndpointAccessControlCommand.getCredentials]: {
    credentials: CredentialData[];
  };
  [EndpointAccessControlCommand.getCredentialsCached]: {
    credentials: CredentialData[];
  };
  [EndpointAccessControlCommand.getCredentialsByType]: {
    credentials: CredentialData[];
  };
  [EndpointAccessControlCommand.getCredentialsByTypeCached]: {
    credentials: CredentialData[];
  };
  [EndpointAccessControlCommand.getAllCredentials]: {
    credentials: CredentialData[];
  };
  [EndpointAccessControlCommand.getAllCredentialsCached]: {
    credentials: CredentialData[];
  };
  [EndpointAccessControlCommand.assignCredential]: {
    result: AssignCredentialResult;
  };
  [EndpointAccessControlCommand.setCredential]: { result: SetCredentialResult };
  [EndpointAccessControlCommand.deleteCredential]: {
    result: SetCredentialResult;
  };
  [EndpointAccessControlCommand.startCredentialLearn]: {
    result?: SupervisionResult;
  };
  [EndpointAccessControlCommand.cancelCredentialLearn]: {
    result?: SupervisionResult;
  };
  [EndpointAccessControlCommand.getAdminCode]: { code?: string };
  [EndpointAccessControlCommand.setAdminCode]: { result?: SupervisionResult };
}

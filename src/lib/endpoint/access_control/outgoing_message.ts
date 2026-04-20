import { SupervisionResult } from "@zwave-js/core";
import {
  SetCredentialStatus,
  SetUserStatus,
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
  [EndpointAccessControlCommand.setUser]: { status: SetUserStatus };
  [EndpointAccessControlCommand.deleteUser]: { status: SetUserStatus };
  [EndpointAccessControlCommand.deleteAllUsers]: { status: SetUserStatus };
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
  [EndpointAccessControlCommand.setCredential]: { status: SetCredentialStatus };
  [EndpointAccessControlCommand.deleteCredential]: {
    status: SetCredentialStatus;
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

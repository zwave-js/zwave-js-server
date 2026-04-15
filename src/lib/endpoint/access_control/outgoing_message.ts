import { SupervisionResult } from "@zwave-js/core";
import type {
  CredentialCapabilities,
  CredentialData,
  UserCapabilities,
  UserData,
} from "zwave-js/Node";
import { EndpointAccessControlCommand } from "./command.js";

export interface EndpointAccessControlResultTypes {
  [EndpointAccessControlCommand.isSupported]: { supported: boolean };
  [EndpointAccessControlCommand.getUserCapabilitiesCached]: {
    capabilities?: UserCapabilities;
  };
  [EndpointAccessControlCommand.getCredentialCapabilitiesCached]: {
    capabilities?: CredentialCapabilities;
  };
  [EndpointAccessControlCommand.getUser]: { user?: UserData };
  [EndpointAccessControlCommand.getUserCached]: { user?: UserData };
  [EndpointAccessControlCommand.getUsers]: { users: UserData[] };
  [EndpointAccessControlCommand.getUsersCached]: { users: UserData[] };
  [EndpointAccessControlCommand.setUser]: { result?: SupervisionResult };
  [EndpointAccessControlCommand.deleteUser]: { result?: SupervisionResult };
  [EndpointAccessControlCommand.deleteAllUsers]: { result?: SupervisionResult };
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
  [EndpointAccessControlCommand.setCredential]: { result?: SupervisionResult };
  [EndpointAccessControlCommand.deleteCredential]: {
    result?: SupervisionResult;
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

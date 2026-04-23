import { IncomingCommandEndpointBase } from "../incoming_message.js";
import { BufferObject } from "../../common.js";
import { EndpointAccessControlCommand } from "./command.js";

export interface EndpointSetUserOptions {
  active?: boolean;
  userType?: number;
  userName?: string;
  credentialRule?: number;
  expiringTimeoutMinutes?: number;
}

export interface IncomingCommandEndpointAccessControlIsSupported extends IncomingCommandEndpointBase {
  command: EndpointAccessControlCommand.isSupported;
}

export interface IncomingCommandEndpointAccessControlGetUserCapabilitiesCached extends IncomingCommandEndpointBase {
  command: EndpointAccessControlCommand.getUserCapabilitiesCached;
}

export interface IncomingCommandEndpointAccessControlGetCredentialCapabilitiesCached extends IncomingCommandEndpointBase {
  command: EndpointAccessControlCommand.getCredentialCapabilitiesCached;
}

export interface IncomingCommandEndpointAccessControlGetUser extends IncomingCommandEndpointBase {
  command: EndpointAccessControlCommand.getUser;
  userId: number;
}

export interface IncomingCommandEndpointAccessControlGetUserCached extends IncomingCommandEndpointBase {
  command: EndpointAccessControlCommand.getUserCached;
  userId: number;
}

export interface IncomingCommandEndpointAccessControlGetUsers extends IncomingCommandEndpointBase {
  command: EndpointAccessControlCommand.getUsers;
}

export interface IncomingCommandEndpointAccessControlGetUsersCached extends IncomingCommandEndpointBase {
  command: EndpointAccessControlCommand.getUsersCached;
}

export interface IncomingCommandEndpointAccessControlSetUser extends IncomingCommandEndpointBase {
  command: EndpointAccessControlCommand.setUser;
  userId: number;
  options: EndpointSetUserOptions;
}

export interface IncomingCommandEndpointAccessControlDeleteUser extends IncomingCommandEndpointBase {
  command: EndpointAccessControlCommand.deleteUser;
  userId: number;
}

export interface IncomingCommandEndpointAccessControlDeleteAllUsers extends IncomingCommandEndpointBase {
  command: EndpointAccessControlCommand.deleteAllUsers;
}

export interface IncomingCommandEndpointAccessControlGetCredential extends IncomingCommandEndpointBase {
  command: EndpointAccessControlCommand.getCredential;
  credentialType: number;
  credentialSlot: number;
}

export interface IncomingCommandEndpointAccessControlGetCredentialCached extends IncomingCommandEndpointBase {
  command: EndpointAccessControlCommand.getCredentialCached;
  credentialType: number;
  credentialSlot: number;
}

export interface IncomingCommandEndpointAccessControlGetCredentials extends IncomingCommandEndpointBase {
  command: EndpointAccessControlCommand.getCredentials;
  userId: number;
}

export interface IncomingCommandEndpointAccessControlGetCredentialsCached extends IncomingCommandEndpointBase {
  command: EndpointAccessControlCommand.getCredentialsCached;
  userId: number;
}

export interface IncomingCommandEndpointAccessControlGetCredentialsByType extends IncomingCommandEndpointBase {
  command: EndpointAccessControlCommand.getCredentialsByType;
  credentialType: number;
}

export interface IncomingCommandEndpointAccessControlGetCredentialsByTypeCached extends IncomingCommandEndpointBase {
  command: EndpointAccessControlCommand.getCredentialsByTypeCached;
  credentialType: number;
}

export interface IncomingCommandEndpointAccessControlGetAllCredentials extends IncomingCommandEndpointBase {
  command: EndpointAccessControlCommand.getAllCredentials;
}

export interface IncomingCommandEndpointAccessControlGetAllCredentialsCached extends IncomingCommandEndpointBase {
  command: EndpointAccessControlCommand.getAllCredentialsCached;
}

export interface IncomingCommandEndpointAccessControlAssignCredential extends IncomingCommandEndpointBase {
  command: EndpointAccessControlCommand.assignCredential;
  credentialType: number;
  credentialSlot: number;
  destinationUserId: number;
}

export interface IncomingCommandEndpointAccessControlSetCredential extends IncomingCommandEndpointBase {
  command: EndpointAccessControlCommand.setCredential;
  userId: number;
  credentialType: number;
  credentialSlot: number;
  data: string | BufferObject;
}

export interface IncomingCommandEndpointAccessControlDeleteCredential extends IncomingCommandEndpointBase {
  command: EndpointAccessControlCommand.deleteCredential;
  userId: number;
  credentialType: number;
  credentialSlot: number;
}

export interface IncomingCommandEndpointAccessControlStartCredentialLearn extends IncomingCommandEndpointBase {
  command: EndpointAccessControlCommand.startCredentialLearn;
  userId: number;
  credentialType: number;
  credentialSlot: number;
  timeout?: number;
}

export interface IncomingCommandEndpointAccessControlCancelCredentialLearn extends IncomingCommandEndpointBase {
  command: EndpointAccessControlCommand.cancelCredentialLearn;
}

export interface IncomingCommandEndpointAccessControlGetAdminCode extends IncomingCommandEndpointBase {
  command: EndpointAccessControlCommand.getAdminCode;
}

export interface IncomingCommandEndpointAccessControlSetAdminCode extends IncomingCommandEndpointBase {
  command: EndpointAccessControlCommand.setAdminCode;
  code: string;
}

export type IncomingMessageEndpointAccessControl =
  | IncomingCommandEndpointAccessControlIsSupported
  | IncomingCommandEndpointAccessControlGetUserCapabilitiesCached
  | IncomingCommandEndpointAccessControlGetCredentialCapabilitiesCached
  | IncomingCommandEndpointAccessControlGetUser
  | IncomingCommandEndpointAccessControlGetUserCached
  | IncomingCommandEndpointAccessControlGetUsers
  | IncomingCommandEndpointAccessControlGetUsersCached
  | IncomingCommandEndpointAccessControlSetUser
  | IncomingCommandEndpointAccessControlDeleteUser
  | IncomingCommandEndpointAccessControlDeleteAllUsers
  | IncomingCommandEndpointAccessControlGetCredential
  | IncomingCommandEndpointAccessControlGetCredentialCached
  | IncomingCommandEndpointAccessControlGetCredentials
  | IncomingCommandEndpointAccessControlGetCredentialsCached
  | IncomingCommandEndpointAccessControlGetCredentialsByType
  | IncomingCommandEndpointAccessControlGetCredentialsByTypeCached
  | IncomingCommandEndpointAccessControlGetAllCredentials
  | IncomingCommandEndpointAccessControlGetAllCredentialsCached
  | IncomingCommandEndpointAccessControlAssignCredential
  | IncomingCommandEndpointAccessControlSetCredential
  | IncomingCommandEndpointAccessControlDeleteCredential
  | IncomingCommandEndpointAccessControlStartCredentialLearn
  | IncomingCommandEndpointAccessControlCancelCredentialLearn
  | IncomingCommandEndpointAccessControlGetAdminCode
  | IncomingCommandEndpointAccessControlSetAdminCode;

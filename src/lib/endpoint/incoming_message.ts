import { CommandClasses, ConfigValue, ConfigValueFormat } from "@zwave-js/core";
import { IncomingCommandBase } from "../incoming_message_base.js";
import { EndpointCommand } from "./command.js";

export interface BufferObject {
  type: "Buffer";
  data: number[];
}

export interface EndpointSetUserOptions {
  active?: boolean;
  userType?: number;
  userName?: string;
  credentialRule?: number;
  expiringTimeoutMinutes?: number;
}

export interface IncomingCommandEndpointBase extends IncomingCommandBase {
  nodeId: number;
  endpoint?: number;
}

export interface IncomingCommandEndpointInvokeCCAPI extends IncomingCommandEndpointBase {
  command: EndpointCommand.invokeCCAPI;
  commandClass: CommandClasses;
  methodName: string;
  args: unknown[];
}

export interface IncomingCommandEndpointGetUserCapabilitiesCached extends IncomingCommandEndpointBase {
  command: EndpointCommand.getUserCapabilitiesCached;
}

export interface IncomingCommandEndpointGetCredentialCapabilitiesCached extends IncomingCommandEndpointBase {
  command: EndpointCommand.getCredentialCapabilitiesCached;
}

export interface IncomingCommandEndpointGetUser extends IncomingCommandEndpointBase {
  command: EndpointCommand.getUser;
  userId: number;
}

export interface IncomingCommandEndpointGetUserCached extends IncomingCommandEndpointBase {
  command: EndpointCommand.getUserCached;
  userId: number;
}

export interface IncomingCommandEndpointGetUsers extends IncomingCommandEndpointBase {
  command: EndpointCommand.getUsers;
}

export interface IncomingCommandEndpointGetUsersCached extends IncomingCommandEndpointBase {
  command: EndpointCommand.getUsersCached;
}

export interface IncomingCommandEndpointSetUser extends IncomingCommandEndpointBase {
  command: EndpointCommand.setUser;
  userId: number;
  options: EndpointSetUserOptions;
}

export interface IncomingCommandEndpointDeleteUser extends IncomingCommandEndpointBase {
  command: EndpointCommand.deleteUser;
  userId: number;
}

export interface IncomingCommandEndpointDeleteAllUsers extends IncomingCommandEndpointBase {
  command: EndpointCommand.deleteAllUsers;
}

export interface IncomingCommandEndpointGetCredential extends IncomingCommandEndpointBase {
  command: EndpointCommand.getCredential;
  userId: number;
  credentialType: number;
  credentialSlot: number;
}

export interface IncomingCommandEndpointGetCredentialCached extends IncomingCommandEndpointBase {
  command: EndpointCommand.getCredentialCached;
  userId: number;
  credentialType: number;
  credentialSlot: number;
}

export interface IncomingCommandEndpointGetCredentials extends IncomingCommandEndpointBase {
  command: EndpointCommand.getCredentials;
  userId: number;
}

export interface IncomingCommandEndpointGetCredentialsCached extends IncomingCommandEndpointBase {
  command: EndpointCommand.getCredentialsCached;
  userId: number;
}

export interface IncomingCommandEndpointSetCredential extends IncomingCommandEndpointBase {
  command: EndpointCommand.setCredential;
  userId: number;
  credentialType: number;
  credentialSlot: number;
  data: string | BufferObject;
}

export interface IncomingCommandEndpointDeleteCredential extends IncomingCommandEndpointBase {
  command: EndpointCommand.deleteCredential;
  userId: number;
  credentialType: number;
  credentialSlot: number;
}

export interface IncomingCommandEndpointStartCredentialLearn extends IncomingCommandEndpointBase {
  command: EndpointCommand.startCredentialLearn;
  userId: number;
  credentialType: number;
  credentialSlot: number;
  timeout?: number;
}

export interface IncomingCommandEndpointCancelCredentialLearn extends IncomingCommandEndpointBase {
  command: EndpointCommand.cancelCredentialLearn;
}

export interface IncomingCommandEndpointGetAdminCode extends IncomingCommandEndpointBase {
  command: EndpointCommand.getAdminCode;
}

export interface IncomingCommandEndpointSetAdminCode extends IncomingCommandEndpointBase {
  command: EndpointCommand.setAdminCode;
  code: string;
}

export interface IncomingCommandEndpointSupportsCCAPI extends IncomingCommandEndpointBase {
  command: EndpointCommand.supportsCCAPI;
  commandClass: CommandClasses;
}

export interface IncomingCommandEndpointSupportsCC extends IncomingCommandEndpointBase {
  command: EndpointCommand.supportsCC;
  commandClass: CommandClasses;
}

export interface IncomingCommandEndpointControlsCC extends IncomingCommandEndpointBase {
  command: EndpointCommand.controlsCC;
  commandClass: CommandClasses;
}

export interface IncomingCommandEndpointIsCCSecure extends IncomingCommandEndpointBase {
  command: EndpointCommand.isCCSecure;
  commandClass: CommandClasses;
}

export interface IncomingCommandEndpointGetCCVersion extends IncomingCommandEndpointBase {
  command: EndpointCommand.getCCVersion;
  commandClass: CommandClasses;
}

export interface IncomingCommandEndpointGetNodeUnsafe extends IncomingCommandEndpointBase {
  command: EndpointCommand.getNodeUnsafe;
}

export interface IncomingCommandEndpointTryGetNode extends IncomingCommandEndpointBase {
  command: EndpointCommand.tryGetNode;
}

export interface IncomingCommandEndpointSetRawConfigParameterValue extends IncomingCommandEndpointBase {
  command: EndpointCommand.setRawConfigParameterValue;
  parameter: number;
  bitMask?: number;
  value: ConfigValue;
  valueSize?: 1 | 2 | 4; // valueSize and valueFormat should be used together.
  valueFormat?: ConfigValueFormat;
}

export interface IncomingCommandEndpointGetRawConfigParameterValue extends IncomingCommandEndpointBase {
  command: EndpointCommand.getRawConfigParameterValue;
  parameter: number;
  bitMask?: number;
}

export interface IncomingCommandEndpointGetCCs extends IncomingCommandEndpointBase {
  command: EndpointCommand.getCCs;
}

export interface IncomingCommandEndpointMaySupportBasicCC extends IncomingCommandEndpointBase {
  command: EndpointCommand.maySupportBasicCC;
}

export interface IncomingCommandEndpointWasCCRemovedViaConfig extends IncomingCommandEndpointBase {
  command: EndpointCommand.wasCCRemovedViaConfig;
  commandClass: CommandClasses;
}

export type IncomingMessageEndpoint =
  | IncomingCommandEndpointInvokeCCAPI
  | IncomingCommandEndpointGetUserCapabilitiesCached
  | IncomingCommandEndpointGetCredentialCapabilitiesCached
  | IncomingCommandEndpointGetUser
  | IncomingCommandEndpointGetUserCached
  | IncomingCommandEndpointGetUsers
  | IncomingCommandEndpointGetUsersCached
  | IncomingCommandEndpointSetUser
  | IncomingCommandEndpointDeleteUser
  | IncomingCommandEndpointDeleteAllUsers
  | IncomingCommandEndpointGetCredential
  | IncomingCommandEndpointGetCredentialCached
  | IncomingCommandEndpointGetCredentials
  | IncomingCommandEndpointGetCredentialsCached
  | IncomingCommandEndpointSetCredential
  | IncomingCommandEndpointDeleteCredential
  | IncomingCommandEndpointStartCredentialLearn
  | IncomingCommandEndpointCancelCredentialLearn
  | IncomingCommandEndpointGetAdminCode
  | IncomingCommandEndpointSetAdminCode
  | IncomingCommandEndpointSupportsCCAPI
  | IncomingCommandEndpointSupportsCC
  | IncomingCommandEndpointControlsCC
  | IncomingCommandEndpointIsCCSecure
  | IncomingCommandEndpointGetCCVersion
  | IncomingCommandEndpointGetNodeUnsafe
  | IncomingCommandEndpointTryGetNode
  | IncomingCommandEndpointSetRawConfigParameterValue
  | IncomingCommandEndpointGetRawConfigParameterValue
  | IncomingCommandEndpointGetCCs
  | IncomingCommandEndpointMaySupportBasicCC
  | IncomingCommandEndpointWasCCRemovedViaConfig;

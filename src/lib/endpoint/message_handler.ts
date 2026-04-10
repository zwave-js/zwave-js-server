import { Driver } from "zwave-js";
import { SupervisionResult } from "@zwave-js/core";
import { UserCredentialType } from "@zwave-js/cc";
import type {
  CredentialCapabilities,
  CredentialData,
  SetUserOptions,
  UserCapabilities,
  UserData,
} from "zwave-js/Node";
import {
  EndpointNotFoundError,
  InvalidParamsPassedToCommandError,
  NodeNotFoundError,
  UnknownCommandError,
} from "../error.js";
import { Client } from "../server.js";
import { dumpNode } from "../state.js";
import { EndpointCommand } from "./command.js";
import { IncomingMessageEndpoint } from "./incoming_message.js";
import { EndpointResultTypes } from "./outgoing_message.js";
import {
  getRawConfigParameterValue,
  setRawConfigParameterValue,
} from "../common.js";
import { MessageHandler } from "../message_handler.js";
import { BufferObject } from "./incoming_message.js";

interface EndpointAccessControl {
  getUserCapabilitiesCached(): UserCapabilities | undefined;
  getCredentialCapabilitiesCached(): CredentialCapabilities | undefined;
  getUser(userId: number): Promise<UserData | undefined>;
  getUserCached(userId: number): UserData | undefined;
  getUsers(): Promise<UserData[]>;
  getUsersCached(): UserData[];
  setUser(
    userId: number,
    options: SetUserOptions,
  ): Promise<SupervisionResult | undefined>;
  deleteUser(userId: number): Promise<SupervisionResult | undefined>;
  deleteAllUsers(): Promise<SupervisionResult | undefined>;
  getCredential(
    userId: number,
    type: UserCredentialType,
    slot: number,
  ): Promise<CredentialData | undefined>;
  getCredentialCached(
    userId: number,
    type: UserCredentialType,
    slot: number,
  ): CredentialData | undefined;
  getCredentials(userId: number): Promise<CredentialData[]>;
  getCredentialsCached(userId: number): CredentialData[];
  setCredential(
    userId: number,
    type: UserCredentialType,
    slot: number,
    data: string | Uint8Array,
  ): Promise<SupervisionResult | undefined>;
  deleteCredential(
    userId: number,
    type: UserCredentialType,
    slot: number,
  ): Promise<SupervisionResult | undefined>;
  startCredentialLearn(
    userId: number,
    type: UserCredentialType,
    slot: number,
    timeout?: number,
  ): Promise<SupervisionResult | undefined>;
  cancelCredentialLearn(): Promise<SupervisionResult | undefined>;
  getAdminCode(): Promise<string | undefined>;
  setAdminCode(code: string): Promise<SupervisionResult | undefined>;
}

function isBufferObject(
  obj: unknown,
): obj is { type: "Buffer"; data: number[] } {
  return (
    obj instanceof Object &&
    Object.keys(obj).length === 2 &&
    "type" in obj &&
    obj.type === "Buffer" &&
    "data" in obj &&
    Array.isArray(obj.data) &&
    obj.data.every((item) => typeof item === "number")
  );
}

function deserializeBufferInArray(array: unknown[]): unknown[] {
  // Iterate over all items in array and deserialize any Buffer objects
  for (let idx = 0; idx < array.length; idx++) {
    const value = array[idx];
    if (isBufferObject(value)) {
      array[idx] = Buffer.from(value.data);
    }
  }
  return array;
}

function deserializeBuffer(value: string | BufferObject): string | Uint8Array {
  if (isBufferObject(value)) {
    return Buffer.from(value.data);
  }
  return value;
}

function isEndpointAccessControl(
  endpoint: unknown,
): endpoint is EndpointAccessControl {
  if (!(endpoint instanceof Object)) return false;
  return (
    "getUserCapabilitiesCached" in endpoint &&
    typeof endpoint.getUserCapabilitiesCached === "function" &&
    "setUser" in endpoint &&
    typeof endpoint.setUser === "function" &&
    "setCredential" in endpoint &&
    typeof endpoint.setCredential === "function" &&
    "setAdminCode" in endpoint &&
    typeof endpoint.setAdminCode === "function"
  );
}

function ensureEndpointAccessControl(endpoint: unknown): EndpointAccessControl {
  if (!isEndpointAccessControl(endpoint)) {
    throw new InvalidParamsPassedToCommandError(
      "This endpoint does not support access control methods",
    );
  }
  return endpoint;
}

export class EndpointMessageHandler implements MessageHandler {
  constructor(
    private driver: Driver,
    private client: Client,
  ) {}

  async handle(
    message: IncomingMessageEndpoint,
  ): Promise<EndpointResultTypes[EndpointCommand]> {
    const { nodeId, command } = message;
    let endpoint;

    const node = this.driver.controller.nodes.get(nodeId);
    if (!node) {
      throw new NodeNotFoundError(nodeId);
    }

    if (message.endpoint) {
      endpoint = node.getEndpoint(message.endpoint);
      if (!endpoint) {
        throw new EndpointNotFoundError(nodeId, message.endpoint);
      }
    } else {
      endpoint = node;
    }

    switch (message.command) {
      case EndpointCommand.invokeCCAPI: {
        const response = await endpoint.invokeCCAPI(
          message.commandClass,
          message.methodName,
          ...deserializeBufferInArray(message.args),
        );
        return { response };
      }
      case EndpointCommand.getUserCapabilitiesCached: {
        const accessControl = ensureEndpointAccessControl(endpoint);
        const capabilities = accessControl.getUserCapabilitiesCached();
        return { capabilities };
      }
      case EndpointCommand.getCredentialCapabilitiesCached: {
        const accessControl = ensureEndpointAccessControl(endpoint);
        const capabilities = accessControl.getCredentialCapabilitiesCached();
        return { capabilities };
      }
      case EndpointCommand.getUser: {
        const accessControl = ensureEndpointAccessControl(endpoint);
        const user = await accessControl.getUser(message.userId);
        return { user };
      }
      case EndpointCommand.getUserCached: {
        const accessControl = ensureEndpointAccessControl(endpoint);
        const user = accessControl.getUserCached(message.userId);
        return { user };
      }
      case EndpointCommand.getUsers: {
        const accessControl = ensureEndpointAccessControl(endpoint);
        const users = await accessControl.getUsers();
        return { users };
      }
      case EndpointCommand.getUsersCached: {
        const accessControl = ensureEndpointAccessControl(endpoint);
        const users = accessControl.getUsersCached();
        return { users };
      }
      case EndpointCommand.setUser: {
        const accessControl = ensureEndpointAccessControl(endpoint);
        const result = await accessControl.setUser(
          message.userId,
          message.options,
        );
        return { result };
      }
      case EndpointCommand.deleteUser: {
        const accessControl = ensureEndpointAccessControl(endpoint);
        const result = await accessControl.deleteUser(message.userId);
        return { result };
      }
      case EndpointCommand.deleteAllUsers: {
        const accessControl = ensureEndpointAccessControl(endpoint);
        const result = await accessControl.deleteAllUsers();
        return { result };
      }
      case EndpointCommand.getCredential: {
        const accessControl = ensureEndpointAccessControl(endpoint);
        const credential = await accessControl.getCredential(
          message.userId,
          message.credentialType as UserCredentialType,
          message.credentialSlot,
        );
        return { credential };
      }
      case EndpointCommand.getCredentialCached: {
        const accessControl = ensureEndpointAccessControl(endpoint);
        const credential = accessControl.getCredentialCached(
          message.userId,
          message.credentialType as UserCredentialType,
          message.credentialSlot,
        );
        return { credential };
      }
      case EndpointCommand.getCredentials: {
        const accessControl = ensureEndpointAccessControl(endpoint);
        const credentials = await accessControl.getCredentials(message.userId);
        return { credentials };
      }
      case EndpointCommand.getCredentialsCached: {
        const accessControl = ensureEndpointAccessControl(endpoint);
        const credentials = accessControl.getCredentialsCached(message.userId);
        return { credentials };
      }
      case EndpointCommand.setCredential: {
        const accessControl = ensureEndpointAccessControl(endpoint);
        const result = await accessControl.setCredential(
          message.userId,
          message.credentialType as UserCredentialType,
          message.credentialSlot,
          deserializeBuffer(message.data),
        );
        return { result };
      }
      case EndpointCommand.deleteCredential: {
        const accessControl = ensureEndpointAccessControl(endpoint);
        const result = await accessControl.deleteCredential(
          message.userId,
          message.credentialType as UserCredentialType,
          message.credentialSlot,
        );
        return { result };
      }
      case EndpointCommand.startCredentialLearn: {
        const accessControl = ensureEndpointAccessControl(endpoint);
        const result = await accessControl.startCredentialLearn(
          message.userId,
          message.credentialType as UserCredentialType,
          message.credentialSlot,
          message.timeout,
        );
        return { result };
      }
      case EndpointCommand.cancelCredentialLearn: {
        const accessControl = ensureEndpointAccessControl(endpoint);
        const result = await accessControl.cancelCredentialLearn();
        return { result };
      }
      case EndpointCommand.getAdminCode: {
        const accessControl = ensureEndpointAccessControl(endpoint);
        const code = await accessControl.getAdminCode();
        return { code };
      }
      case EndpointCommand.setAdminCode: {
        const accessControl = ensureEndpointAccessControl(endpoint);
        const result = await accessControl.setAdminCode(message.code);
        return { result };
      }
      case EndpointCommand.supportsCCAPI: {
        const supported = endpoint.supportsCCAPI(message.commandClass);
        return { supported };
      }
      case EndpointCommand.supportsCC: {
        const supported = endpoint.supportsCC(message.commandClass);
        return { supported };
      }
      case EndpointCommand.controlsCC: {
        const controlled = endpoint.controlsCC(message.commandClass);
        return { controlled };
      }
      case EndpointCommand.isCCSecure: {
        const secure = endpoint.isCCSecure(message.commandClass);
        return { secure };
      }
      case EndpointCommand.getCCVersion: {
        const version = endpoint.getCCVersion(message.commandClass);
        return { version };
      }
      case EndpointCommand.getNodeUnsafe:
      case EndpointCommand.tryGetNode: {
        const node = endpoint.tryGetNode();
        return {
          node:
            node === undefined
              ? node
              : dumpNode(node, this.client.schemaVersion),
        };
      }
      case EndpointCommand.setRawConfigParameterValue: {
        return setRawConfigParameterValue(message, endpoint);
      }
      case EndpointCommand.getRawConfigParameterValue: {
        return getRawConfigParameterValue(message, endpoint);
      }
      case EndpointCommand.getCCs: {
        const commandClasses = Object.fromEntries(endpoint.getCCs());
        return { commandClasses };
      }
      case EndpointCommand.maySupportBasicCC: {
        const maySupport = endpoint.maySupportBasicCC();
        return { maySupport };
      }
      case EndpointCommand.wasCCRemovedViaConfig: {
        const removed = endpoint.wasCCRemovedViaConfig(message.commandClass);
        return { removed };
      }
      default: {
        throw new UnknownCommandError(command);
      }
    }
  }
}

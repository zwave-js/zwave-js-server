import { Endpoint } from "zwave-js";
import { UserCredentialType } from "@zwave-js/cc";
import type { AccessControlAPI } from "zwave-js/Node";
import {
  InvalidParamsPassedToCommandError,
  UnknownCommandError,
} from "../../error.js";
import { EndpointAccessControlCommand } from "./command.js";
import { IncomingMessageEndpointAccessControl } from "./incoming_message.js";
import { EndpointAccessControlResultTypes } from "./outgoing_message.js";
import { deserializeBuffer } from "../../common.js";

function ensureAccessControl(endpoint: Endpoint): AccessControlAPI {
  const api = endpoint.accessControl;
  if (api === undefined) {
    throw new InvalidParamsPassedToCommandError(
      "This endpoint does not support access control methods",
    );
  }
  return api;
}

export async function handleEndpointAccessControlCommand(
  message: IncomingMessageEndpointAccessControl,
  endpoint: Endpoint,
): Promise<EndpointAccessControlResultTypes[EndpointAccessControlCommand]> {
  switch (message.command) {
    case EndpointAccessControlCommand.isSupported: {
      return { supported: endpoint.accessControl !== undefined };
    }
    case EndpointAccessControlCommand.getUserCapabilitiesCached: {
      const capabilities =
        ensureAccessControl(endpoint).getUserCapabilitiesCached();
      return { capabilities };
    }
    case EndpointAccessControlCommand.getCredentialCapabilitiesCached: {
      const capabilities =
        ensureAccessControl(endpoint).getCredentialCapabilitiesCached();
      return { capabilities };
    }
    case EndpointAccessControlCommand.getUser: {
      const user = await ensureAccessControl(endpoint).getUser(message.userId);
      return { user };
    }
    case EndpointAccessControlCommand.getUserCached: {
      const user = ensureAccessControl(endpoint).getUserCached(message.userId);
      return { user };
    }
    case EndpointAccessControlCommand.getUsers: {
      const users = await ensureAccessControl(endpoint).getUsers();
      return { users };
    }
    case EndpointAccessControlCommand.getUsersCached: {
      const users = ensureAccessControl(endpoint).getUsersCached();
      return { users };
    }
    case EndpointAccessControlCommand.setUser: {
      const result = await ensureAccessControl(endpoint).setUser(
        message.userId,
        message.options,
      );
      return { result };
    }
    case EndpointAccessControlCommand.deleteUser: {
      const result = await ensureAccessControl(endpoint).deleteUser(
        message.userId,
      );
      return { result };
    }
    case EndpointAccessControlCommand.deleteAllUsers: {
      const result = await ensureAccessControl(endpoint).deleteAllUsers();
      return { result };
    }
    case EndpointAccessControlCommand.getCredential: {
      const credential = await ensureAccessControl(endpoint).getCredential(
        message.credentialType as UserCredentialType,
        message.credentialSlot,
      );
      return { credential };
    }
    case EndpointAccessControlCommand.getCredentialCached: {
      const credential = ensureAccessControl(endpoint).getCredentialCached(
        message.credentialType as UserCredentialType,
        message.credentialSlot,
      );
      return { credential };
    }
    case EndpointAccessControlCommand.getCredentials: {
      const credentials = await ensureAccessControl(
        endpoint,
      ).getCredentialsForUser(message.userId);
      return { credentials };
    }
    case EndpointAccessControlCommand.getCredentialsCached: {
      const credentials = ensureAccessControl(
        endpoint,
      ).getCredentialsForUserCached(message.userId);
      return { credentials };
    }
    case EndpointAccessControlCommand.getCredentialsByType: {
      const credentials = await ensureAccessControl(
        endpoint,
      ).getCredentialsByType(message.credentialType as UserCredentialType);
      return { credentials };
    }
    case EndpointAccessControlCommand.getCredentialsByTypeCached: {
      const credentials = ensureAccessControl(
        endpoint,
      ).getCredentialsByTypeCached(
        message.credentialType as UserCredentialType,
      );
      return { credentials };
    }
    case EndpointAccessControlCommand.getAllCredentials: {
      const credentials =
        await ensureAccessControl(endpoint).getAllCredentials();
      return { credentials };
    }
    case EndpointAccessControlCommand.getAllCredentialsCached: {
      const credentials =
        ensureAccessControl(endpoint).getAllCredentialsCached();
      return { credentials };
    }
    case EndpointAccessControlCommand.assignCredential: {
      const result = await ensureAccessControl(endpoint).assignCredential(
        message.credentialType as UserCredentialType,
        message.credentialSlot,
        message.destinationUserId,
      );
      return { result };
    }
    case EndpointAccessControlCommand.setCredential: {
      const result = await ensureAccessControl(endpoint).setCredential(
        message.userId,
        message.credentialType as UserCredentialType,
        message.credentialSlot,
        deserializeBuffer(message.data),
      );
      return { result };
    }
    case EndpointAccessControlCommand.deleteCredential: {
      const result = await ensureAccessControl(endpoint).deleteCredential(
        message.userId,
        message.credentialType as UserCredentialType,
        message.credentialSlot,
      );
      return { result };
    }
    case EndpointAccessControlCommand.startCredentialLearn: {
      const result = await ensureAccessControl(endpoint).startCredentialLearn(
        message.userId,
        message.credentialType as UserCredentialType,
        message.credentialSlot,
        message.timeout,
      );
      return { result };
    }
    case EndpointAccessControlCommand.cancelCredentialLearn: {
      const result =
        await ensureAccessControl(endpoint).cancelCredentialLearn();
      return { result };
    }
    case EndpointAccessControlCommand.getAdminCode: {
      const code = await ensureAccessControl(endpoint).getAdminCode();
      return { code };
    }
    case EndpointAccessControlCommand.setAdminCode: {
      const result = await ensureAccessControl(endpoint).setAdminCode(
        message.code,
      );
      return { result };
    }
    default: {
      throw new UnknownCommandError((message as { command: string }).command);
    }
  }
}

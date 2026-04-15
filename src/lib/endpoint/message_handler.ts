import { Driver } from "zwave-js";
import {
  EndpointNotFoundError,
  NodeNotFoundError,
  UnknownCommandError,
} from "../error.js";
import { Client } from "../server.js";
import { dumpNode } from "../state.js";
import { EndpointCommand } from "./command.js";
import { IncomingMessageEndpoint } from "./incoming_message.js";
import { EndpointResultTypes } from "./outgoing_message.js";
import {
  deserializeBufferInArray,
  getRawConfigParameterValue,
  setRawConfigParameterValue,
} from "../common.js";
import { MessageHandler } from "../message_handler.js";
import { EndpointAccessControlCommand } from "./access_control/command.js";
import { IncomingMessageEndpointAccessControl } from "./access_control/incoming_message.js";
import { handleEndpointAccessControlCommand } from "./access_control/message_handler.js";

function isAccessControlMessage(
  message: IncomingMessageEndpoint,
): message is IncomingMessageEndpointAccessControl {
  return (Object.values(EndpointAccessControlCommand) as string[]).includes(
    message.command,
  );
}

export class EndpointMessageHandler implements MessageHandler {
  constructor(
    private driver: Driver,
    private client: Client,
  ) {}

  async handle(
    message: IncomingMessageEndpoint,
  ): Promise<
    EndpointResultTypes[EndpointCommand | EndpointAccessControlCommand]
  > {
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

    if (isAccessControlMessage(message)) {
      return handleEndpointAccessControlCommand(message, endpoint);
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

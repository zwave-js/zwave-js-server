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
  getRawConfigParameterValue,
  setRawConfigParameterValue,
} from "../common.js";
import { MessageHandler } from "../message_handler.js";

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
        const result: EndpointResultTypes[EndpointCommand.getCCs] = {
          commandClasses: {},
        };
        for (const [ccId, info] of endpoint.getCCs()) {
          result.commandClasses[ccId] = info;
        }
        return result;
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

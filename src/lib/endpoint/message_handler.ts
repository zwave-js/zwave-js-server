import { Driver } from "zwave-js";
import {
  EndpointNotFoundError,
  NodeNotFoundError,
  UnknownCommandError,
} from "../error";
import { Client } from "../server";
import { dumpNode } from "../state";
import { EndpointCommand } from "./command";
import { IncomingMessageEndpoint } from "./incoming_message";
import { EndpointResultTypes } from "./outgoing_message";

const isBufferObject = (obj: any): boolean => {
  return (
    obj instanceof Object &&
    Object.keys(obj).length === 2 &&
    "type" in obj &&
    obj.type === "Buffer" &&
    "data" in obj &&
    Array.isArray(obj.data)
  );
};

const deserializeBufferInArray = (array: Array<any>): Array<any> => {
  // Iterate over all items in array and deserialize any Buffer objects
  for (var idx = 0; idx < array.length; idx++) {
    const value = array[idx];
    if (isBufferObject(value)) {
      array[idx] = Buffer.from(value.data);
    }
  }
  return array;
};

export class EndpointMessageHandler {
  static async handle(
    message: IncomingMessageEndpoint,
    driver: Driver,
    client: Client
  ): Promise<EndpointResultTypes[EndpointCommand]> {
    const { nodeId, command } = message;
    let endpoint;

    const node = driver.controller.nodes.get(nodeId);
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
      case EndpointCommand.invokeCCAPI:
        const response = await endpoint.invokeCCAPI(
          message.commandClass,
          message.methodName,
          ...deserializeBufferInArray(message.args)
        );
        return { response };
      case EndpointCommand.supportsCCAPI:
        return { supported: endpoint.supportsCCAPI(message.commandClass) };
      case EndpointCommand.supportsCC:
        return { supported: endpoint.supportsCC(message.commandClass) };
      case EndpointCommand.controlsCC:
        return { controlled: endpoint.controlsCC(message.commandClass) };
      case EndpointCommand.isCCSecure:
        return { secure: endpoint.isCCSecure(message.commandClass) };
      case EndpointCommand.getCCVersion:
        return { version: endpoint.getCCVersion(message.commandClass) };
      case EndpointCommand.getNodeUnsafe:
        const node = endpoint.getNodeUnsafe();
        return {
          node:
            node === undefined ? node : dumpNode(node, client.schemaVersion),
        };
      default:
        throw new UnknownCommandError(command);
    }
  }
}

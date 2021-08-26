import { Driver } from "zwave-js";
import {
  EndpointNotFoundError,
  NodeNotFoundError,
  UnknownCommandError,
} from "../error";
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
    obj.data instanceof Array
  );
};

const deserializeBufferInArray = (array: Array<any>): Array<any> => {
  // Iterate over all items in array and recursively deserialize them
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
    driver: Driver
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
        const supported = endpoint.supportsCCAPI(message.commandClass);
        return { supported };
      default:
        throw new UnknownCommandError(command);
    }
  }
}

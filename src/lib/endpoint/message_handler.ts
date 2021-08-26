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

const deserializeBufferInObject = (obj: any): any => {
  // If obj is a simple data type, we can return it as is
  if (!(obj instanceof Object)) {
    return obj;
  }
  // If obj matches the signature of a deserialized JSON serialized buffer, return the
  // deserialized version of it
  if (isBufferObject(obj)) {
    return Buffer.from(obj.data);
  }
  // Iterate over all properties of obj and recursively deserialize them
  for (const key of Object.keys(obj)) {
    obj[key] = deserializeBufferInObject(obj[key]);
  }
  return obj;
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
          ...deserializeBufferInObject(message.args)
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

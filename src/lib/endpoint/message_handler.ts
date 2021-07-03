import { Driver } from "zwave-js";
import {
  EndpointNotFoundError,
  NodeNotFoundError,
  UnknownCommandError,
} from "../error";
import { EndpointCommand } from "./command";
import { IncomingMessageEndpoint } from "./incoming_message";
import { EndpointResultTypes } from "./outgoing_message";

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
      case EndpointCommand.supportsCCAPI:
        const supported = endpoint.supportsCCAPI(message.commandClass);
        return { supported };
      case EndpointCommand.invokeCCAPI:
        const response = await endpoint.invokeCCAPI(
          message.commandClass,
          message.method,
          ...message.args
        );
        return { response };
      default:
        throw new UnknownCommandError(command);
    }
  }
}

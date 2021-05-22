import { Driver } from "zwave-js";
import {
  MissingInputParameterError,
  UnknownCommandError,
  VirtualEndpointNotFoundError,
} from "../error";
import { VirtualEndpointCommand } from "./command";
import { IncomingMessageVirtualEndpoint } from "./incoming_message";
import { VirtualEndpointResultTypes } from "./outgoing_message";

export class VirtualEndpointMessageHandler {
  static async handle(
    message: IncomingMessageVirtualEndpoint,
    driver: Driver
  ): Promise<VirtualEndpointResultTypes[VirtualEndpointCommand]> {
    const { command } = message;

    if (!message.broadcast && !message.nodeIDs) {
      throw new MissingInputParameterError(command, ["broadcast", "nodeIDs"]);
    }
    const virtualNode = message.nodeIDs
      ? driver.controller.getMulticastGroup(message.nodeIDs)
      : driver.controller.getBroadcastNode();
    const virtualEndpoint = virtualNode.getEndpoint(message.index);
    if (!virtualEndpoint) {
      throw new VirtualEndpointNotFoundError(
        message.index,
        message.nodeIDs,
        message.broadcast
      );
    }

    switch (message.command) {
      case VirtualEndpointCommand.supportsCC:
        const supported = virtualEndpoint.supportsCC(message.commandClass);
        return { supported };
      case VirtualEndpointCommand.getCCVersion:
        const version = virtualEndpoint.getCCVersion(message.commandClass);
        return { version };
      default:
        throw new UnknownCommandError(command);
    }
  }
}

import { Driver } from "zwave-js";
import { UnknownCommandError, VirtualEndpointNotFoundError } from "../error";
import { VirtualEndpointCommand } from "./command";
import { IncomingMessageVirtualEndpoint } from "./incoming_message";
import { VirtualEndpointResultTypes } from "./outgoing_message";

export class VirtualEndpointMessageHandler {
  static async handle(
    message: IncomingMessageVirtualEndpoint,
    driver: Driver
  ): Promise<VirtualEndpointResultTypes[VirtualEndpointCommand]> {
    const { command } = message;

    const virtualNode =
      "nodeIDs" in message
        ? driver.controller.getMulticastGroup(message.nodeIDs)
        : driver.controller.getBroadcastNode();
    const virtualEndpoint = virtualNode.getEndpoint(message.index);
    if (!virtualEndpoint) {
      throw new VirtualEndpointNotFoundError(
        message.index,
        "nodeIDs" in message ? message.nodeIDs : undefined,
        "nodeIDs" in message ? undefined : true
      );
    }

    switch (message.command) {
      case VirtualEndpointCommand.supportsCCBroadcast:
      case VirtualEndpointCommand.supportsCCMulticast:
        const supported = virtualEndpoint.supportsCC(message.commandClass);
        return { supported };
      case VirtualEndpointCommand.getCCVersionBroadcast:
      case VirtualEndpointCommand.getCCVersionMulticast:
        const version = virtualEndpoint.getCCVersion(message.commandClass);
        return { version };
      default:
        throw new UnknownCommandError(command);
    }
  }
}

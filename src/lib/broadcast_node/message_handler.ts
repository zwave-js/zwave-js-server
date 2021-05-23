import { Driver } from "zwave-js";
import { UnknownCommandError, VirtualEndpointNotFoundError } from "../error";
import { BroadcastNodeCommand } from "./command";
import { IncomingMessageBroadcastNode } from "./incoming_message";
import { BroadcastNodeResultTypes } from "./outgoing_message";

export class BroadcastNodeMessageHandler {
  static async handle(
    message: IncomingMessageBroadcastNode,
    driver: Driver
  ): Promise<BroadcastNodeResultTypes[BroadcastNodeCommand]> {
    const { command } = message;
    let virtualEndpoint;

    const virtualNode = driver.controller.getBroadcastNode();

    switch (message.command) {
      case BroadcastNodeCommand.setValue:
        const success = await virtualNode.setValue(
          message.valueId,
          message.value
        );
        return { success };
      case BroadcastNodeCommand.getEndpointCount:
        const count = virtualNode.getEndpointCount();
        return { count };
      case BroadcastNodeCommand.supportsCC:
        virtualEndpoint = virtualNode.getEndpoint(message.index);
        if (!virtualEndpoint) {
          throw new VirtualEndpointNotFoundError(
            message.index,
            undefined,
            true
          );
        }
        const supported = virtualEndpoint.supportsCC(message.commandClass);
        return { supported };
      case BroadcastNodeCommand.getCCVersion:
        virtualEndpoint = virtualNode.getEndpoint(message.index);
        if (!virtualEndpoint) {
          throw new VirtualEndpointNotFoundError(
            message.index,
            undefined,
            true
          );
        }
        const version = virtualEndpoint.getCCVersion(message.commandClass);
        return { version };
      default:
        throw new UnknownCommandError(command);
    }
  }
}

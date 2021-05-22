import { Driver } from "zwave-js";
import { MissingInputParameterError, UnknownCommandError } from "../error";
import { VirtualNodeCommand } from "./command";
import { IncomingMessageVirtualNode } from "./incoming_message";
import { VirtualNodeResultTypes } from "./outgoing_message";

export class VirtualNodeMessageHandler {
  static async handle(
    message: IncomingMessageVirtualNode,
    driver: Driver
  ): Promise<VirtualNodeResultTypes[VirtualNodeCommand]> {
    const { command } = message;

    if (!message.broadcast && !message.nodeIDs) {
      throw new MissingInputParameterError(command, ["broadcast", "nodeIDs"]);
    }
    const virtualNode = message.nodeIDs
      ? driver.controller.getMulticastGroup(message.nodeIDs)
      : driver.controller.getBroadcastNode();

    switch (message.command) {
      case VirtualNodeCommand.getEndpointCount:
        const count = virtualNode.getEndpointCount();
        return { count };
      case VirtualNodeCommand.setValue:
        const success = await virtualNode.setValue(
          message.valueId,
          message.value
        );
        return { success };
      default:
        throw new UnknownCommandError(command);
    }
  }
}

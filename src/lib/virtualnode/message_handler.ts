import { Driver } from "zwave-js";
import { UnknownCommandError } from "../error";
import { VirtualNodeCommand } from "./command";
import { IncomingMessageVirtualNode } from "./incoming_message";
import { VirtualNodeResultTypes } from "./outgoing_message";

export class VirtualNodeMessageHandler {
  static async handle(
    message: IncomingMessageVirtualNode,
    driver: Driver
  ): Promise<VirtualNodeResultTypes[VirtualNodeCommand]> {
    const { command } = message;
    const virtualNode =
      "nodeIDs" in message
        ? driver.controller.getMulticastGroup(message.nodeIDs)
        : driver.controller.getBroadcastNode();

    switch (message.command) {
      case VirtualNodeCommand.setValueBroadcast:
      case VirtualNodeCommand.setValueMulticast:
        const success = await virtualNode.setValue(
          message.valueId,
          message.value
        );
        return { success };
      case VirtualNodeCommand.getEndpointCountBroadcast:
      case VirtualNodeCommand.getEndpointCountMulticast:
        const count = virtualNode.getEndpointCount();
        return { count };
      default:
        throw new UnknownCommandError(command);
    }
  }
}

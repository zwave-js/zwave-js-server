import { Driver } from "zwave-js";
import { NodeNotFoundError, UnknownCommandError } from "../error";
import { NodeCommand } from "./command";
import { IncomingMessageNode } from "./incoming_message";
import { NodeResultTypes } from "./outgoing_message";

export class NodeMessageHandler {
  static async handle(
    message: IncomingMessageNode,
    driver: Driver
  ): Promise<NodeResultTypes[NodeCommand]> {
    const { nodeId } = message;

    const node = driver.controller.nodes.get(nodeId);
    if (!node) {
      throw new NodeNotFoundError(nodeId);
    }

    switch (message.command) {
      case NodeCommand.setValue:
        const { value, valueId } = message;
        const success = await node.setValue(valueId, value);
        return { success };
      default:
        throw new UnknownCommandError(message.command);
    }
  }
}

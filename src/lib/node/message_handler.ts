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
    const { nodeId, command } = message;

    const node = driver.controller.nodes.get(nodeId);
    if (!node) {
      throw new NodeNotFoundError(nodeId);
    }

    switch (message.command) {
      case NodeCommand.setValue:
        const success = await node.setValue(message.valueId, message.value);
        return { success };
      case NodeCommand.refreshInfo:
        await node.refreshInfo();
        return {};
      case NodeCommand.getDefinedValueIDs:
        const valueIds = node.getDefinedValueIDs();
        return { valueIds };
      case NodeCommand.getValueMetadata:
        return node.getValueMetadata(message.valueId);
      case NodeCommand.abortFirmwareUpdate:
        await node.abortFirmwareUpdate();
        return {};
      default:
        throw new UnknownCommandError(command);
    }
  }
}

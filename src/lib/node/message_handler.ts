import { Driver } from "zwave-js";
import { CommandClasses } from "@zwave-js/core";
import { NodeNotFoundError, UnknownCommandError } from "../error";
import { Client } from "../server";
import { dumpConfigurationMetadata, dumpMetadata } from "../state";
import { NodeCommand } from "./command";
import { IncomingMessageNode } from "./incoming_message";
import { NodeResultTypes } from "./outgoing_message";
import { ConfigurationMetadata } from "zwave-js/build/lib/commandclass/ConfigurationCC";

export class NodeMessageHandler {
  static async handle(
    message: IncomingMessageNode,
    driver: Driver,
    client: Client
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
        if (message.valueId.commandClass == CommandClasses.Configuration) {
          return dumpConfigurationMetadata(
            node.getValueMetadata(message.valueId) as ConfigurationMetadata,
            client.schemaVersion
          );
        }

        return dumpMetadata(
          node.getValueMetadata(message.valueId),
          client.schemaVersion
        );
      case NodeCommand.abortFirmwareUpdate:
        await node.abortFirmwareUpdate();
        return {};
      case NodeCommand.pollValue:
        const value = await node.pollValue<any>(message.valueId);
        return { value };
      case NodeCommand.setRawConfigParameterValue:
        await node.commandClasses.Configuration.set(
          message.parameter,
          message.value,
          message.valueSize
        );
        return {};
      default:
        throw new UnknownCommandError(command);
    }
  }
}

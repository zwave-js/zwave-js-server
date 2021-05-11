import { Driver } from "zwave-js";
import {
  CommandClasses,
  ConfigurationMetadata,
  extractFirmware,
  Firmware,
  guessFirmwareFileFormat,
} from "@zwave-js/core";
import { NodeNotFoundError, UnknownCommandError } from "../error";
import { Client } from "../server";
import { dumpConfigurationMetadata, dumpMetadata } from "../state";
import { NodeCommand } from "./command";
import { IncomingMessageNode } from "./incoming_message";
import { NodeResultTypes } from "./outgoing_message";

export class NodeMessageHandler {
  static async handle(
    message: IncomingMessageNode,
    driver: Driver,
    client: Client
  ): Promise<NodeResultTypes[NodeCommand]> {
    const { nodeId, command } = message;
    let firmwareFile: Buffer;
    let actualFirmware: Firmware;

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
      case NodeCommand.beginFirmwareUpdate:
        firmwareFile = Buffer.from(message.firmwareFile, "base64");
        const format = message.firmwareFileFormat
          ? message.firmwareFileFormat
          : guessFirmwareFileFormat(message.firmwareFilename, firmwareFile);
        actualFirmware = extractFirmware(firmwareFile, format);
        await node.beginFirmwareUpdate(
          actualFirmware.data,
          actualFirmware.firmwareTarget
        );
        return {};
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
      case NodeCommand.refreshValues:
        await node.refreshValues();
        return {};
      case NodeCommand.refreshCCValues:
        await node.refreshCCValues(message.commandClass);
        return {};
      default:
        throw new UnknownCommandError(command);
    }
  }
}

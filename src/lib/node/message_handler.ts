import {
  Driver,
  LifelineHealthCheckSummary,
  RouteHealthCheckSummary,
  ZWaveNode,
} from "zwave-js";
import {
  CommandClasses,
  ConfigurationMetadata,
  extractFirmware,
  Firmware,
  guessFirmwareFileFormat,
} from "@zwave-js/core";
import { NodeNotFoundError, UnknownCommandError } from "../error";
import { Client, ClientsController } from "../server";
import { dumpConfigurationMetadata, dumpMetadata } from "../state";
import { NodeCommand } from "./command";
import { IncomingMessageNode } from "./incoming_message";
import { NodeResultTypes } from "./outgoing_message";
import { dumpNode } from "..";

export class NodeMessageHandler {
  private firmwareUpdateProgress: Record<number, boolean> = {};

  public async handle(
    message: IncomingMessageNode,
    driver: Driver,
    clientsController: ClientsController,
    client: Client
  ): Promise<NodeResultTypes[NodeCommand]> {
    const { nodeId, command } = message;
    let value: any;
    let firmwareFile: Buffer;
    let actualFirmware: Firmware;
    let summary: LifelineHealthCheckSummary | RouteHealthCheckSummary;

    const node = driver.controller.nodes.get(nodeId);
    if (!node) {
      throw new NodeNotFoundError(nodeId);
    }

    switch (message.command) {
      case NodeCommand.setValue:
        const success = await node.setValue(
          message.valueId,
          message.value,
          message.options
        );
        return { success };
      case NodeCommand.refreshInfo:
        await node.refreshInfo(message.options);
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
        if (this.firmwareUpdateProgress[nodeId]) {
          throw new Error("Firmware update already in progress");
        }
        firmwareFile = Buffer.from(message.firmwareFile, "base64");
        const format = message.firmwareFileFormat
          ? message.firmwareFileFormat
          : guessFirmwareFileFormat(message.firmwareFilename, firmwareFile);
        actualFirmware = extractFirmware(firmwareFile, format);
        await node.beginFirmwareUpdate(
          actualFirmware.data,
          message.target ?? actualFirmware.firmwareTarget
        );
        if (!(nodeId in this.firmwareUpdateProgress)) {
          node.on(
            "firmware update finished",
            (changedNode: ZWaveNode, __: number) => {
              this.firmwareUpdateProgress[changedNode.nodeId] = false;
            }
          );
        }
        this.firmwareUpdateProgress[nodeId] = true;
        return {};
      case NodeCommand.abortFirmwareUpdate:
        await node.abortFirmwareUpdate();
        this.firmwareUpdateProgress[nodeId] = false;
        return {};
      case NodeCommand.getFirmwareUpdateCapabilities:
        const capabilities = await node.getFirmwareUpdateCapabilities();
        return { capabilities };
      case NodeCommand.pollValue:
        value = await node.pollValue<any>(message.valueId);
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
      case NodeCommand.ping:
        const responded = await node.ping();
        return { responded };
      case NodeCommand.hasSecurityClass:
        const hasSecurityClass = node.hasSecurityClass(message.securityClass);
        return { hasSecurityClass };
      case NodeCommand.getHighestSecurityClass:
        const highestSecurityClass = node.getHighestSecurityClass();
        return { highestSecurityClass };
      case NodeCommand.testPowerlevel:
        const framesAcked = await node.testPowerlevel(
          message.testNodeId,
          message.powerlevel,
          message.testFrameCount,
          (acknowledged: number, total: number) => {
            clientsController.clients.forEach((client) =>
              client.sendEvent({
                source: "node",
                event: "test powerlevel progress",
                nodeId: message.nodeId,
                acknowledged,
                total,
              })
            );
          }
        );
        return { framesAcked };
      case NodeCommand.checkLifelineHealth:
        summary = await node.checkLifelineHealth(
          message.rounds,
          (round: number, totalRounds: number, lastRating: number) => {
            clientsController.clients.forEach((client) =>
              client.sendEvent({
                source: "node",
                event: "check lifeline health progress",
                nodeId: message.nodeId,
                round,
                totalRounds,
                lastRating,
              })
            );
          }
        );
        return { summary };
      case NodeCommand.checkRouteHealth:
        summary = await node.checkRouteHealth(
          message.targetNodeId,
          message.rounds,
          (round: number, totalRounds: number, lastRating: number) => {
            clientsController.clients.forEach((client) =>
              client.sendEvent({
                source: "node",
                event: "check route health progress",
                nodeId: message.nodeId,
                round,
                totalRounds,
                lastRating,
              })
            );
          }
        );
        return { summary };
      case NodeCommand.getValue:
        value = node.getValue<any>(message.valueId);
        return { value };
      case NodeCommand.getEndpointCount:
        const count = node.getEndpointCount();
        return { count };
      case NodeCommand.interviewCC:
        node.interviewCC(message.commandClass);
        return {};
      case NodeCommand.getState:
        const state = dumpNode(node, client.schemaVersion);
        return { state };
      case NodeCommand.setKeepAwake:
        node.keepAwake = message.keepAwake;
        return {};
      case NodeCommand.setLocation:
        node.location = message.location;
        if (
          (message.updateCC ?? true) &&
          node.supportsCC(CommandClasses["Node Naming and Location"])
        ) {
          await node.commandClasses["Node Naming and Location"].setLocation(
            message.location
          );
        }
        return {};
      case NodeCommand.setName:
        node.name = message.name;
        if (
          (message.updateCC ?? true) &&
          node.supportsCC(CommandClasses["Node Naming and Location"])
        ) {
          await node.commandClasses["Node Naming and Location"].setName(
            message.name
          );
        }
        return {};
      case NodeCommand.getFirmwareUpdateProgress:
        return {
          anyProgress: Object.values(this.firmwareUpdateProgress).includes(
            true
          ),
          progress: this.firmwareUpdateProgress[nodeId] === true,
        };
      case NodeCommand.waitForWakeup:
        await node.waitForWakeup();
        return {};
      default:
        throw new UnknownCommandError(command);
    }
  }
}

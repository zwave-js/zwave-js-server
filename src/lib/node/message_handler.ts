import {
  Driver,
  LifelineHealthCheckResult,
  RouteHealthCheckResult,
} from "zwave-js";
import {
  CommandClasses,
  ConfigurationMetadata,
  extractFirmware,
  guessFirmwareFileFormat,
} from "@zwave-js/core";
import { NodeNotFoundError, UnknownCommandError } from "../error";
import { Client, ClientsController } from "../server";
import { dumpConfigurationMetadata, dumpMetadata } from "../state";
import { NodeCommand } from "./command";
import { IncomingMessageNode } from "./incoming_message";
import { NodeResultTypes } from "./outgoing_message";
import { dumpNode } from "..";
import {
  firmwareUpdateOutgoingMessage,
  setRawConfigParameterValue,
  setValueOutgoingMessage,
} from "../common";
import { OutgoingEvent } from "../outgoing_message";

export class NodeMessageHandler {
  public async handle(
    message: IncomingMessageNode,
    clientsController: ClientsController,
    driver: Driver,
    client: Client,
  ): Promise<NodeResultTypes[NodeCommand]> {
    const { nodeId, command } = message;

    const node = driver.controller.nodes.get(nodeId);
    if (!node) {
      throw new NodeNotFoundError(nodeId);
    }

    switch (message.command) {
      case NodeCommand.setValue: {
        const result = await node.setValue(
          message.valueId,
          message.value,
          message.options,
        );
        return setValueOutgoingMessage(result, client.schemaVersion);
      }
      case NodeCommand.refreshInfo: {
        await node.refreshInfo(message.options);
        return {};
      }
      case NodeCommand.getDefinedValueIDs: {
        const valueIds = node.getDefinedValueIDs();
        return { valueIds };
      }
      case NodeCommand.getValueMetadata: {
        if (message.valueId.commandClass == CommandClasses.Configuration) {
          return dumpConfigurationMetadata(
            node.getValueMetadata(message.valueId) as ConfigurationMetadata,
            client.schemaVersion,
          );
        }

        return dumpMetadata(
          node.getValueMetadata(message.valueId),
          client.schemaVersion,
        );
      }
      case NodeCommand.beginFirmwareUpdate: {
        const firmwareFile = Buffer.from(message.firmwareFile, "base64");
        let firmware = extractFirmware(
          firmwareFile,
          message.firmwareFileFormat ??
            guessFirmwareFileFormat(message.firmwareFilename, firmwareFile),
        );
        // Defer to the target provided in the messaage when available
        firmware.firmwareTarget = message.target ?? firmware.firmwareTarget;
        const result = await node.updateFirmware([firmware]);
        return firmwareUpdateOutgoingMessage(result, client.schemaVersion);
      }
      case NodeCommand.updateFirmware: {
        const updates = message.updates.map((update) => {
          const file = Buffer.from(update.file, "base64");
          let firmware = extractFirmware(
            file,
            update.fileFormat ?? guessFirmwareFileFormat(update.filename, file),
          );
          // Defer to the target provided in the messaage when available
          firmware.firmwareTarget =
            update.firmwareTarget ?? firmware.firmwareTarget;
          return firmware;
        });
        const result = await node.updateFirmware(updates);
        return firmwareUpdateOutgoingMessage(result, client.schemaVersion);
      }
      case NodeCommand.abortFirmwareUpdate: {
        await node.abortFirmwareUpdate();
        return {};
      }
      case NodeCommand.getFirmwareUpdateCapabilities: {
        const capabilities = await node.getFirmwareUpdateCapabilities();
        return { capabilities };
      }
      case NodeCommand.getFirmwareUpdateCapabilitiesCached: {
        const capabilities = node.getFirmwareUpdateCapabilitiesCached();
        return { capabilities };
      }
      case NodeCommand.pollValue: {
        const value = await node.pollValue<any>(message.valueId);
        return { value };
      }
      case NodeCommand.setRawConfigParameterValue: {
        return setRawConfigParameterValue(message, node);
      }
      case NodeCommand.refreshValues: {
        await node.refreshValues();
        return {};
      }
      case NodeCommand.refreshCCValues: {
        await node.refreshCCValues(message.commandClass);
        return {};
      }
      case NodeCommand.ping: {
        const responded = await node.ping();
        return { responded };
      }
      case NodeCommand.hasSecurityClass: {
        const hasSecurityClass = node.hasSecurityClass(message.securityClass);
        return { hasSecurityClass };
      }
      case NodeCommand.getHighestSecurityClass: {
        const highestSecurityClass = node.getHighestSecurityClass();
        return { highestSecurityClass };
      }
      case NodeCommand.testPowerlevel: {
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
              }),
            );
          },
        );
        return { framesAcked };
      }
      case NodeCommand.checkLifelineHealth: {
        const summary = await node.checkLifelineHealth(
          message.rounds,
          (
            round: number,
            totalRounds: number,
            lastRating: number,
            lastResult: LifelineHealthCheckResult,
          ) => {
            const returnEvent0: OutgoingEvent = {
              source: "node",
              event: "check lifeline health progress",
              nodeId: message.nodeId,
              round,
              totalRounds,
              lastRating,
            };
            const returnEvent31 = { ...returnEvent0, lastResult };
            clientsController.clients.forEach((client) => {
              client.sendEvent(
                client.schemaVersion >= 31 ? returnEvent31 : returnEvent0,
              );
            });
          },
        );
        return { summary };
      }
      case NodeCommand.checkRouteHealth: {
        const summary = await node.checkRouteHealth(
          message.targetNodeId,
          message.rounds,
          (
            round: number,
            totalRounds: number,
            lastRating: number,
            lastResult: RouteHealthCheckResult,
          ) => {
            const returnEvent0: OutgoingEvent = {
              source: "node",
              event: "check route health progress",
              nodeId: message.nodeId,
              round,
              totalRounds,
              lastRating,
            };
            const returnEvent31 = { ...returnEvent0, lastResult };
            clientsController.clients.forEach((client) => {
              client.sendEvent(
                client.schemaVersion >= 31 ? returnEvent31 : returnEvent0,
              );
            });
          },
        );
        return { summary };
      }
      case NodeCommand.getValue: {
        const value = node.getValue<any>(message.valueId);
        return { value };
      }
      case NodeCommand.getEndpointCount: {
        const count = node.getEndpointCount();
        return { count };
      }
      case NodeCommand.interviewCC: {
        await node.interviewCC(message.commandClass);
        return {};
      }
      case NodeCommand.getState: {
        const state = dumpNode(node, client.schemaVersion);
        return { state };
      }
      case NodeCommand.setKeepAwake: {
        node.keepAwake = message.keepAwake;
        return {};
      }
      case NodeCommand.setLocation: {
        node.location = message.location;
        if (
          (message.updateCC ?? true) &&
          node.supportsCC(CommandClasses["Node Naming and Location"])
        ) {
          await node.commandClasses["Node Naming and Location"].setLocation(
            message.location,
          );
        }
        return {};
      }
      case NodeCommand.setName: {
        node.name = message.name;
        if (
          (message.updateCC ?? true) &&
          node.supportsCC(CommandClasses["Node Naming and Location"])
        ) {
          await node.commandClasses["Node Naming and Location"].setName(
            message.name,
          );
        }
        return {};
      }
      case NodeCommand.getFirmwareUpdateProgress:
      case NodeCommand.isFirmwareUpdateInProgress: {
        const progress = node.isFirmwareUpdateInProgress();
        return { progress };
      }
      case NodeCommand.waitForWakeup: {
        await node.waitForWakeup();
        return {};
      }
      case NodeCommand.interview: {
        await node.interview();
        return {};
      }
      case NodeCommand.getValueTimestamp: {
        const timestamp = node.getValueTimestamp(message.valueId);
        return { timestamp };
      }
      case NodeCommand.manuallyIdleNotificationValue: {
        node.manuallyIdleNotificationValue(message.valueId);
        return {};
      }
      case NodeCommand.setDateAndTime: {
        const success = await node.setDateAndTime(
          message.date === undefined ? undefined : new Date(message.date),
        );
        return { success };
      }
      case NodeCommand.getDateAndTime: {
        const dateAndTime = await node.getDateAndTime();
        return { dateAndTime };
      }
      case NodeCommand.isHealthCheckInProgress: {
        const progress = node.isHealthCheckInProgress();
        return { progress };
      }
      case NodeCommand.abortHealthCheck: {
        await node.abortHealthCheck();
        return {};
      }
      case NodeCommand.setDefaultVolume: {
        node.defaultVolume = message.defaultVolume;
        return {};
      }
      case NodeCommand.setDefaultTransitionDuration: {
        node.defaultTransitionDuration = message.defaultTransitionDuration;
        return {};
      }
      case NodeCommand.hasDeviceConfigChanged: {
        const changed = node.hasDeviceConfigChanged();
        return { changed };
      }
      default: {
        throw new UnknownCommandError(command);
      }
    }
  }
}

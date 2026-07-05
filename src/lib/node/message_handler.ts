import {
  Driver,
  LifelineHealthCheckResult,
  RouteHealthCheckResult,
  SetCredentialResult,
  SetValueResult,
  SetValueStatus,
  ZWaveNode,
} from "zwave-js";
import { UserCredentialType, UserIDStatus } from "@zwave-js/cc";
import {
  CommandClasses,
  ConfigurationMetadata,
  Firmware,
} from "@zwave-js/core";
import { NodeNotFoundError, UnknownCommandError } from "../error.js";
import { Client } from "../server.js";
import { dumpConfigurationMetadata, dumpMetadata, dumpNode } from "../state.js";
import { NodeCommand } from "./command.js";
import {
  IncomingCommandNodeSetValue,
  IncomingMessageNode,
} from "./incoming_message.js";
import { NodeResultTypes } from "./outgoing_message.js";
import {
  firmwareUpdateOutgoingMessage,
  getRawConfigParameterValue,
  parseAndExtractFirmware,
  setRawConfigParameterValue,
  setValueOutgoingMessage,
} from "../common.js";
import { OutgoingEvent } from "../outgoing_message.js";
import { MessageHandler } from "../message_handler.js";

export class NodeMessageHandler implements MessageHandler {
  constructor(
    private driver: Driver,
    private client: Client,
  ) {}

  public async handle(
    message: IncomingMessageNode,
  ): Promise<NodeResultTypes[NodeCommand]> {
    const { nodeId, command } = message;

    const node = this.driver.controller.nodes.get(nodeId);
    if (!node) {
      throw new NodeNotFoundError(nodeId);
    }

    switch (message.command) {
      case NodeCommand.setValue: {
        // zwave-js removed `setValue` support for User Code CC user codes,
        // so route them through the access control API to keep legacy
        // clients working
        let result =
          message.valueId.commandClass === CommandClasses["User Code"]
            ? await trySetUserCodeValue(node, message)
            : undefined;
        if (result === undefined) {
          result = await node.setValue(
            message.valueId,
            message.value,
            message.options,
          );
        }
        return setValueOutgoingMessage(result, this.client.schemaVersion);
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
            this.client.schemaVersion,
          );
        }

        return dumpMetadata(
          node.getValueMetadata(message.valueId),
          this.client.schemaVersion,
        );
      }
      case NodeCommand.beginFirmwareUpdate: {
        const firmwareFile = Buffer.from(message.firmwareFile, "base64");
        const firmware = await parseAndExtractFirmware(
          message.firmwareFilename,
          firmwareFile,
          message.firmwareFileFormat,
        );
        // Defer to the target provided in the message when available
        firmware.firmwareTarget = message.target ?? firmware.firmwareTarget;
        const result = await node.updateFirmware([firmware]);
        return firmwareUpdateOutgoingMessage(result, this.client.schemaVersion);
      }
      case NodeCommand.updateFirmware: {
        const updates: Firmware[] = [];
        for (const update of message.updates) {
          const file = Buffer.from(update.file, "base64");
          const firmware = await parseAndExtractFirmware(
            update.filename,
            file,
            update.fileFormat,
          );
          // Defer to the target provided in the message when available
          firmware.firmwareTarget =
            update.firmwareTarget ?? firmware.firmwareTarget;
          updates.push(firmware);
        }
        const result = await node.updateFirmware(updates);
        return firmwareUpdateOutgoingMessage(result, this.client.schemaVersion);
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
      case NodeCommand.getRawConfigParameterValue: {
        return getRawConfigParameterValue(message, node);
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
            this.client.trySendEvent({
              source: "node",
              event: "test powerlevel progress",
              nodeId: message.nodeId,
              acknowledged,
              total,
            });
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
            const event: OutgoingEvent =
              this.client.schemaVersion >= 31
                ? {
                    source: "node",
                    event: "check lifeline health progress",
                    nodeId: message.nodeId,
                    round,
                    totalRounds,
                    lastRating,
                    lastResult,
                  }
                : {
                    source: "node",
                    event: "check lifeline health progress",
                    nodeId: message.nodeId,
                    round,
                    totalRounds,
                    lastRating,
                  };
            this.client.trySendEvent(event);
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
            const event: OutgoingEvent =
              this.client.schemaVersion >= 31
                ? {
                    source: "node",
                    event: "check route health progress",
                    nodeId: message.nodeId,
                    round,
                    totalRounds,
                    lastRating,
                    lastResult,
                  }
                : {
                    source: "node",
                    event: "check route health progress",
                    nodeId: message.nodeId,
                    round,
                    totalRounds,
                    lastRating,
                  };
            this.client.trySendEvent(event);
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
        const state = dumpNode(node, this.client.schemaVersion);
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
        if ("valueId" in message) {
          node.manuallyIdleNotificationValue(message.valueId);
        } else {
          node.manuallyIdleNotificationValue(
            message.notificationType,
            message.prevValue,
            message.endpointIndex,
          );
        }
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
        node.abortHealthCheck();
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
      case NodeCommand.createDump: {
        const dump = node.createDump();
        return { dump };
      }
      case NodeCommand.getSupportedNotificationEvents: {
        const events = node.getSupportedNotificationEvents();
        return { events };
      }
      // Link reliability check
      case NodeCommand.checkLinkReliability: {
        const result = await node.checkLinkReliability({
          mode: message.mode,
          interval: message.interval,
          rounds: message.rounds,
          onProgress: (progress) => {
            this.client.trySendEvent(
              {
                source: "node",
                event: "check link reliability progress",
                nodeId: message.nodeId,
                progress,
              },
              { minSchemaVersion: 47 },
            );
          },
        });
        return { result };
      }
      case NodeCommand.isLinkReliabilityCheckInProgress: {
        const progress = node.isLinkReliabilityCheckInProgress();
        return { progress };
      }
      case NodeCommand.abortLinkReliabilityCheck: {
        node.abortLinkReliabilityCheck();
        return {};
      }
      default: {
        throw new UnknownCommandError(command);
      }
    }
  }
}

/**
 * Handles a legacy User Code CC `setValue` call via the unified access
 * control API on a best-effort basis. Returns `undefined` when the value
 * cannot be routed, in which case the caller should fall back to
 * `node.setValue`.
 */
async function trySetUserCodeValue(
  node: ZWaveNode,
  message: IncomingCommandNodeSetValue,
): Promise<SetValueResult | undefined> {
  const { endpoint: endpointIndex, property, propertyKey } = message.valueId;
  const isClear =
    property === "userIdStatus" && message.value === UserIDStatus.Available;
  const isSet = property === "userCode" && typeof message.value === "string";
  if ((!isClear && !isSet) || typeof propertyKey !== "number") {
    return undefined;
  }

  const accessControl = node.getEndpoint(endpointIndex ?? 0)?.accessControl;
  if (accessControl === undefined) {
    return undefined;
  }

  // User Code CC devices support exactly one credential type: Password
  // instead of PINCode when the device allows non-PIN characters
  const { supportedCredentialTypes } =
    accessControl.getCredentialCapabilitiesCached();
  const credentialType = [
    UserCredentialType.PINCode,
    UserCredentialType.Password,
  ].find((type) => supportedCredentialTypes.has(type));
  if (credentialType === undefined) {
    return undefined;
  }

  // For User Code CC devices the credential slot mirrors the user ID
  return convertSetCredentialResultToSetValueResult(
    isClear
      ? await accessControl.deleteCredential(credentialType, propertyKey)
      : await accessControl.setCredential(
          propertyKey,
          credentialType,
          propertyKey,
          message.value as string,
        ),
  );
}

function convertSetCredentialResultToSetValueResult(
  result: SetCredentialResult,
): SetValueResult {
  switch (result) {
    case SetCredentialResult.OK:
      return { status: SetValueStatus.Success };
    case SetCredentialResult.Error_AddRejectedLocationOccupied:
      return {
        status: SetValueStatus.InvalidValue,
        message: "The credential slot is already occupied",
      };
    case SetCredentialResult.Error_ModifyRejectedLocationEmpty:
      return {
        status: SetValueStatus.InvalidValue,
        message: "The credential slot is empty",
      };
    case SetCredentialResult.Error_DuplicateCredential:
      return {
        status: SetValueStatus.InvalidValue,
        message: "A credential with this value already exists",
      };
    case SetCredentialResult.Error_ManufacturerSecurityRules:
      return {
        status: SetValueStatus.InvalidValue,
        message: "The credential violates manufacturer security rules",
      };
    case SetCredentialResult.Error_DuplicateAdminPINCode:
      return {
        status: SetValueStatus.InvalidValue,
        message: "The credential duplicates the admin PIN code",
      };
    case SetCredentialResult.Error_WrongUserUniqueIdentifier:
      return {
        status: SetValueStatus.InvalidValue,
        message: "The user unique identifier is invalid",
      };
    case SetCredentialResult.Error_Unknown:
    default:
      return { status: SetValueStatus.Fail };
  }
}

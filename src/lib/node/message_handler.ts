import {
  Driver,
  LifelineHealthCheckResult,
  RouteHealthCheckResult,
  SetCredentialResult,
  SetUserResult,
  SetValueResult,
  SetValueStatus,
  supervisionResultToSetValueResult,
  ZWaveNode,
} from "zwave-js";
import {
  UserCredentialType,
  UserCredentialUserType,
  UserIDStatus,
} from "@zwave-js/cc";
import {
  CommandClasses,
  ConfigurationMetadata,
  Firmware,
  ZWaveError,
  ZWaveErrorCodes,
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
  const { value } = message;
  const accessControl = node.getEndpoint(endpointIndex ?? 0)?.accessControl;
  if (accessControl === undefined) {
    return undefined;
  }

  // Support devices that were interviewed before the rename to adminCode
  if (property === "adminCode" || property === "masterCode") {
    if (typeof value !== "string") {
      return undefined;
    }
    return supervisionResultToSetValueResult(
      await accessControl.setAdminCode(value),
    );
  }

  if (
    (property !== "userIdStatus" && property !== "userCode") ||
    typeof propertyKey !== "number"
  ) {
    return undefined;
  }

  if (property === "userIdStatus" && value !== UserIDStatus.Available) {
    try {
      switch (value) {
        case UserIDStatus.Enabled:
          return convertSetUserResultToSetValueResult(
            await accessControl.setUser(propertyKey, { active: true }),
          );
        case UserIDStatus.Disabled:
          return convertSetUserResultToSetValueResult(
            await accessControl.setUser(propertyKey, { active: false }),
          );
        case UserIDStatus.Messaging:
          return convertSetUserResultToSetValueResult(
            await accessControl.setUser(propertyKey, {
              active: true,
              userType: UserCredentialUserType.NonAccess,
            }),
          );
        default:
          // Other statuses (e.g. PassageMode) have no access control equivalent
          return undefined;
      }
    } catch (error) {
      // User Code CC devices reject status changes on empty slots because
      // users and codes must be stored together. Legacy clients expect a
      // SetValueResult rather than an error response.
      if (
        error instanceof ZWaveError &&
        error.code === ZWaveErrorCodes.Argument_Invalid
      ) {
        return { status: SetValueStatus.InvalidValue, message: error.message };
      }
      throw error;
    }
  }

  // Setting a user code or clearing one (userIdStatus = Available) maps to
  // the user's single credential.
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
  if (property === "userIdStatus") {
    return convertSetCredentialResultToSetValueResult(
      await accessControl.deleteCredential(credentialType, propertyKey),
    );
  }
  if (typeof value !== "string" && !(value instanceof Uint8Array)) {
    return undefined;
  }
  return convertSetCredentialResultToSetValueResult(
    await accessControl.setCredential(
      propertyKey,
      credentialType,
      propertyKey,
      value,
    ),
  );
}

function convertSetUserResultToSetValueResult(
  result: SetUserResult,
): SetValueResult {
  switch (result) {
    case SetUserResult.OK:
      return { status: SetValueStatus.Success };
    case SetUserResult.Error_AddRejectedLocationOccupied:
      return {
        status: SetValueStatus.InvalidValue,
        message: "The user slot is already occupied",
      };
    case SetUserResult.Error_ModifyRejectedLocationEmpty:
      return {
        status: SetValueStatus.InvalidValue,
        message: "The user slot is empty",
      };
    case SetUserResult.Error_Unknown:
    default:
      return { status: SetValueStatus.Fail };
  }
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

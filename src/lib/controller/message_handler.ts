import {
  createDeferredPromise,
  DeferredPromise,
} from "alcalzone-shared/deferred-promise";
import {
  parseQRCodeString,
  Driver,
  InclusionGrant,
  InclusionOptions,
  InclusionStrategy,
  ReplaceNodeOptions,
  extractFirmware,
  guessFirmwareFileFormat,
  ExclusionStrategy,
  ExclusionOptions,
} from "zwave-js";
import { dumpController } from "..";
import {
  InclusionAlreadyInProgressError,
  InclusionPhaseNotInProgressError,
  InvalidParamsPassedToCommandError,
  NoLongerSupportedError,
  UnknownCommandError,
} from "../error";
import { Client, ClientsController } from "../server";
import { ControllerCommand } from "./command";
import {
  IncomingCommandControllerBeginExclusion,
  IncomingCommandControllerBeginExclusionLegacy,
  IncomingCommandControllerBeginInclusion,
  IncomingCommandControllerBeginInclusionLegacy,
  IncomingCommandControllerReplaceFailedNode,
  IncomingCommandControllerReplaceFailedNodeLegacy,
  IncomingMessageController,
} from "./incoming_message";
import { ControllerResultTypes } from "./outgoing_message";
import { firmwareUpdateOutgoingMessage } from "../common";
import { inclusionUserCallbacks } from "../inclusion_user_callbacks";

export class ControllerMessageHandler {
  static async handle(
    message: IncomingMessageController,
    clientsController: ClientsController,
    driver: Driver,
    client: Client,
  ): Promise<ControllerResultTypes[ControllerCommand]> {
    const { command } = message;

    switch (message.command) {
      case ControllerCommand.beginInclusion: {
        if (
          clientsController.grantSecurityClassesPromise ||
          clientsController.validateDSKAndEnterPinPromise
        )
          throw new InclusionAlreadyInProgressError();
        const success = await driver.controller.beginInclusion(
          processInclusionOptions(clientsController, client, message),
        );
        return { success };
      }
      case ControllerCommand.grantSecurityClasses: {
        if (!clientsController.grantSecurityClassesPromise)
          throw new InclusionPhaseNotInProgressError(
            "grantSecurityClassesPromise",
          );
        clientsController.grantSecurityClassesPromise.resolve(
          message.inclusionGrant,
        );
        return {};
      }
      case ControllerCommand.validateDSKAndEnterPIN: {
        if (!clientsController.validateDSKAndEnterPinPromise)
          throw new InclusionPhaseNotInProgressError(
            "validateDSKAndEnterPinPromise",
          );
        clientsController.validateDSKAndEnterPinPromise.resolve(message.pin);
        return {};
      }
      case ControllerCommand.provisionSmartStartNode: {
        if (typeof message.entry === "string") {
          driver.controller.provisionSmartStartNode(
            parseQRCodeString(message.entry),
          );
        } else {
          driver.controller.provisionSmartStartNode(message.entry);
        }
        return {};
      }
      case ControllerCommand.unprovisionSmartStartNode: {
        driver.controller.unprovisionSmartStartNode(message.dskOrNodeId);
        return {};
      }
      case ControllerCommand.getProvisioningEntry: {
        const dskOrNodeId = message.dskOrNodeId || message.dsk;
        if (!dskOrNodeId) {
          throw new InvalidParamsPassedToCommandError(
            "Must include one of dsk or dskOrNodeId in call to getProvisioningEntry",
          );
        }
        const entry = driver.controller.getProvisioningEntry(dskOrNodeId);
        return { entry };
      }
      case ControllerCommand.getProvisioningEntries: {
        const entries = driver.controller.getProvisioningEntries();
        return { entries };
      }
      case ControllerCommand.stopInclusion: {
        const success = await driver.controller.stopInclusion();
        return { success };
      }
      case ControllerCommand.beginExclusion: {
        const success = await driver.controller.beginExclusion(
          processExclusionOptions(message),
        );
        return { success };
      }
      case ControllerCommand.stopExclusion: {
        const success = await driver.controller.stopExclusion();
        return { success };
      }
      case ControllerCommand.removeFailedNode: {
        await driver.controller.removeFailedNode(message.nodeId);
        return {};
      }
      case ControllerCommand.replaceFailedNode: {
        const success = await driver.controller.replaceFailedNode(
          message.nodeId,
          processInclusionOptions(
            clientsController,
            client,
            message,
          ) as ReplaceNodeOptions,
        );
        return { success };
      }
      // Schema <= 31
      case ControllerCommand.healNode:
      case ControllerCommand.rebuildNodeRoutes: {
        const success = await driver.controller.rebuildNodeRoutes(
          message.nodeId,
        );
        return { success };
      }
      // Schema <= 31
      case ControllerCommand.beginHealingNetwork: {
        const success = driver.controller.beginRebuildingRoutes();
        return { success };
      }
      // Schema >= 32
      case ControllerCommand.beginRebuildingRoutes: {
        const success = driver.controller.beginRebuildingRoutes(
          message.options!,
        );
        return { success };
      }
      // Schema <= 31
      case ControllerCommand.stopHealingNetwork:
      // Schema >= 32
      case ControllerCommand.stopRebuildingRoutes: {
        const success = driver.controller.stopRebuildingRoutes();
        return { success };
      }
      case ControllerCommand.isFailedNode: {
        const failed = await driver.controller.isFailedNode(message.nodeId);
        return { failed };
      }
      case ControllerCommand.getAssociationGroups: {
        const groups: ControllerResultTypes[ControllerCommand.getAssociationGroups]["groups"] =
          {};
        driver.controller
          .getAssociationGroups({
            nodeId: message.nodeId,
            endpoint: message.endpoint,
          })
          .forEach((value, key) => (groups[key] = value));
        return { groups };
      }
      case ControllerCommand.getAssociations: {
        const associations: ControllerResultTypes[ControllerCommand.getAssociations]["associations"] =
          {};
        driver.controller
          .getAssociations({
            nodeId: message.nodeId,
            endpoint: message.endpoint,
          })
          .forEach((value, key) => (associations[key] = value));
        return { associations };
      }
      case ControllerCommand.isAssociationAllowed: {
        const allowed = driver.controller.isAssociationAllowed(
          { nodeId: message.nodeId, endpoint: message.endpoint },
          message.group,
          message.association,
        );
        return { allowed };
      }
      case ControllerCommand.addAssociations: {
        await driver.controller.addAssociations(
          { nodeId: message.nodeId, endpoint: message.endpoint },
          message.group,
          message.associations,
        );
        return {};
      }
      case ControllerCommand.removeAssociations: {
        await driver.controller.removeAssociations(
          { nodeId: message.nodeId, endpoint: message.endpoint },
          message.group,
          message.associations,
        );
        return {};
      }
      case ControllerCommand.removeNodeFromAllAssocations:
      case ControllerCommand.removeNodeFromAllAssociations: {
        await driver.controller.removeNodeFromAllAssociations(message.nodeId);
        return {};
      }
      case ControllerCommand.getNodeNeighbors: {
        const neighbors = await driver.controller.getNodeNeighbors(
          message.nodeId,
        );
        return { neighbors };
      }
      case ControllerCommand.supportsFeature: {
        const supported = driver.controller.supportsFeature(message.feature);
        return { supported };
      }
      case ControllerCommand.backupNVMRaw: {
        const nvmDataRaw = await driver.controller.backupNVMRaw(
          (bytesRead: number, total: number) => {
            clientsController.clients.forEach((client) =>
              client.sendEvent({
                source: "controller",
                event: "nvm backup progress",
                bytesRead,
                total,
              }),
            );
          },
        );
        return { nvmData: nvmDataRaw.toString("base64") };
      }
      case ControllerCommand.restoreNVM: {
        const nvmData = Buffer.from(message.nvmData, "base64");
        await driver.controller.restoreNVM(
          nvmData,
          (bytesRead: number, total: number) => {
            clientsController.clients.forEach((client) =>
              client.sendEvent({
                source: "controller",
                event: "nvm convert progress",
                bytesRead,
                total,
              }),
            );
          },
          (bytesWritten: number, total: number) => {
            clientsController.clients.forEach((client) =>
              client.sendEvent({
                source: "controller",
                event: "nvm restore progress",
                bytesWritten,
                total,
              }),
            );
          },
        );
        return {};
      }
      case ControllerCommand.setRFRegion: {
        const success = await driver.controller.setRFRegion(message.region);
        return { success };
      }
      case ControllerCommand.getRFRegion: {
        const region = await driver.controller.getRFRegion();
        return { region };
      }
      case ControllerCommand.setPowerlevel: {
        const success = await driver.controller.setPowerlevel(
          message.powerlevel,
          message.measured0dBm,
        );
        return { success };
      }
      case ControllerCommand.getPowerlevel: {
        return await driver.controller.getPowerlevel();
      }
      case ControllerCommand.getState: {
        const state = dumpController(driver, client.schemaVersion);
        return { state };
      }
      case ControllerCommand.getKnownLifelineRoutes: {
        const routes = driver.controller.getKnownLifelineRoutes();
        return { routes };
      }
      case ControllerCommand.getAnyFirmwareUpdateProgress:
      case ControllerCommand.isAnyOTAFirmwareUpdateInProgress: {
        return {
          progress: driver.controller.isAnyOTAFirmwareUpdateInProgress(),
        };
      }
      case ControllerCommand.getAvailableFirmwareUpdates: {
        return {
          updates: await driver.controller.getAvailableFirmwareUpdates(
            message.nodeId,
            {
              apiKey: message.apiKey,
              additionalUserAgentComponents:
                client.additionalUserAgentComponents,
              includePrereleases: message.includePrereleases,
            },
          ),
        };
      }
      case ControllerCommand.beginOTAFirmwareUpdate: {
        throw new NoLongerSupportedError(
          ControllerCommand.beginOTAFirmwareUpdate +
            " is a legacy command that is no longer supported.",
        );
      }
      case ControllerCommand.firmwareUpdateOTA: {
        if (message.updates !== undefined) {
          throw new NoLongerSupportedError(
            ControllerCommand.firmwareUpdateOTA +
              " no longer accepts the `updates` parameter and expects `updateInfo` instead.",
          );
        }
        if (message.updateInfo === undefined) {
          throw new InvalidParamsPassedToCommandError(
            "Missing required parameter `updateInfo`",
          );
        }
        const result = await driver.controller.firmwareUpdateOTA(
          message.nodeId,
          message.updateInfo,
        );
        return firmwareUpdateOutgoingMessage(result, client.schemaVersion);
      }
      case ControllerCommand.firmwareUpdateOTW: {
        const file = Buffer.from(message.file, "base64");
        const result = await driver.controller.firmwareUpdateOTW(
          extractFirmware(
            file,
            message.fileFormat ??
              guessFirmwareFileFormat(message.filename, file),
          ).data,
        );
        return firmwareUpdateOutgoingMessage(result, client.schemaVersion);
      }
      case ControllerCommand.isFirmwareUpdateInProgress: {
        const progress = driver.controller.isFirmwareUpdateInProgress();
        return { progress };
      }
      default: {
        throw new UnknownCommandError(command);
      }
    }
  }
}

function processExclusionOptions(
  message:
    | IncomingCommandControllerBeginExclusion
    | IncomingCommandControllerBeginExclusionLegacy,
): ExclusionOptions | undefined {
  if ("options" in message) {
    return message.options;
  } else if ("unprovision" in message) {
    if (typeof message.unprovision === "boolean") {
      return {
        strategy: message.unprovision
          ? ExclusionStrategy.Unprovision
          : ExclusionStrategy.ExcludeOnly,
      };
    } else if (message.unprovision === "inactive") {
      return {
        strategy: ExclusionStrategy.DisableProvisioningEntry,
      };
    }
  } else if ("strategy" in message && message.strategy !== undefined) {
    return { strategy: message.strategy };
  }
}

function processInclusionOptions(
  clientsController: ClientsController,
  client: Client,
  message:
    | IncomingCommandControllerBeginInclusion
    | IncomingCommandControllerBeginInclusionLegacy
    | IncomingCommandControllerReplaceFailedNode
    | IncomingCommandControllerReplaceFailedNodeLegacy,
): InclusionOptions | ReplaceNodeOptions {
  // Schema 8+ inclusion handling
  if ("options" in message) {
    const options = message.options;
    if (
      options.strategy === InclusionStrategy.Default ||
      options.strategy === InclusionStrategy.Security_S2
    ) {
      // When using Security_S2 inclusion, the user can either provide the provisioning details ahead
      // of time or go through a standard inclusion process and let the driver/client prompt them
      // for provisioning details based on information received from the device. We have to handle
      // each scenario separately.
      if ("provisioning" in options) {
        // There are three input options when providing provisioning details ahead of time:
        // PlannedProvisioningEntry, QRProvisioningInformation, or a QR code string which the server
        // will automatically parse into a QRProvisioningInformation object before proceeding with the
        // inclusion process
        if (typeof options.provisioning === "string") {
          options.provisioning = parseQRCodeString(options.provisioning);
        }
      } else {
        // @ts-expect-error
        options.userCallbacks = inclusionUserCallbacks(
          clientsController,
          client,
        );
      }
    }
    return options;
  }
  // Schema <=7 inclusion handling (backwards compatibility logic)
  if ("includeNonSecure" in message && message.includeNonSecure)
    return {
      strategy: InclusionStrategy.Insecure,
    };
  return {
    strategy: InclusionStrategy.Security_S0,
  };
}

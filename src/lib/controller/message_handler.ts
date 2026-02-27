import {
  parseQRCodeString,
  Driver,
  InclusionOptions,
  InclusionStrategy,
  ReplaceNodeOptions,
  extractFirmware,
  ExclusionStrategy,
  ExclusionOptions,
  AssociationCheckResult,
  JoinNetworkStrategy,
  type AssociationAddress,
} from "zwave-js";
import {
  InclusionAlreadyInProgressError,
  InclusionPhaseNotInProgressError,
  InvalidParamsPassedToCommandError,
  NoLongerSupportedError,
  UnknownCommandError,
} from "../error.js";
import { Client, ClientsController } from "../server.js";
import { ControllerCommand } from "./command.js";
import {
  IncomingCommandControllerBeginExclusion,
  IncomingCommandControllerBeginExclusionLegacy,
  IncomingCommandControllerBeginInclusion,
  IncomingCommandControllerBeginInclusionLegacy,
  IncomingCommandControllerReplaceFailedNode,
  IncomingCommandControllerReplaceFailedNodeLegacy,
  IncomingMessageController,
} from "./incoming_message.js";
import { ControllerResultTypes } from "./outgoing_message.js";
import {
  firmwareUpdateOutgoingMessage,
  getFirmwareUpdateOptions,
  parseFirmwareFile,
} from "../common.js";
import { inclusionUserCallbacks } from "../inclusion_user_callbacks.js";
import { MessageHandler } from "../message_handler.js";
import { dumpController } from "../state.js";

export class ControllerMessageHandler implements MessageHandler {
  constructor(
    private clientsController: ClientsController,
    private driver: Driver,
    private client: Client,
  ) {}

  async handle(
    message: IncomingMessageController,
  ): Promise<ControllerResultTypes[ControllerCommand]> {
    const { command } = message;

    switch (message.command) {
      case ControllerCommand.beginInclusion: {
        if (
          this.clientsController.grantSecurityClassesPromise ||
          this.clientsController.validateDSKAndEnterPinPromise
        )
          throw new InclusionAlreadyInProgressError();
        const success = await this.driver.controller.beginInclusion(
          await processInclusionOptions(
            this.clientsController,
            this.client,
            message,
          ),
        );
        return { success };
      }
      case ControllerCommand.grantSecurityClasses: {
        if (!this.clientsController.grantSecurityClassesPromise)
          throw new InclusionPhaseNotInProgressError(
            "grantSecurityClassesPromise",
          );
        this.clientsController.grantSecurityClassesPromise.resolve(
          message.inclusionGrant,
        );
        return {};
      }
      case ControllerCommand.validateDSKAndEnterPIN: {
        if (!this.clientsController.validateDSKAndEnterPinPromise)
          throw new InclusionPhaseNotInProgressError(
            "validateDSKAndEnterPinPromise",
          );
        this.clientsController.validateDSKAndEnterPinPromise.resolve(
          message.pin,
        );
        return {};
      }
      case ControllerCommand.provisionSmartStartNode: {
        if (typeof message.entry === "string") {
          this.driver.controller.provisionSmartStartNode(
            await parseQRCodeString(message.entry),
          );
        } else {
          this.driver.controller.provisionSmartStartNode(message.entry);
        }
        return {};
      }
      case ControllerCommand.unprovisionSmartStartNode: {
        this.driver.controller.unprovisionSmartStartNode(message.dskOrNodeId);
        return {};
      }
      case ControllerCommand.getProvisioningEntry: {
        const dskOrNodeId = message.dskOrNodeId || message.dsk;
        if (!dskOrNodeId) {
          throw new InvalidParamsPassedToCommandError(
            "Must include one of dsk or dskOrNodeId in call to getProvisioningEntry",
          );
        }
        const entry = this.driver.controller.getProvisioningEntry(dskOrNodeId);
        return { entry };
      }
      case ControllerCommand.getProvisioningEntries: {
        const entries = this.driver.controller.getProvisioningEntries();
        return { entries };
      }
      case ControllerCommand.stopInclusion: {
        const success = await this.driver.controller.stopInclusion();
        return { success };
      }
      case ControllerCommand.cancelSecureBootstrapS2: {
        this.driver.controller.cancelSecureBootstrapS2(message.reason);
        return {};
      }
      case ControllerCommand.beginExclusion: {
        const success = await this.driver.controller.beginExclusion(
          processExclusionOptions(message),
        );
        return { success };
      }
      case ControllerCommand.stopExclusion: {
        const success = await this.driver.controller.stopExclusion();
        return { success };
      }
      case ControllerCommand.removeFailedNode: {
        await this.driver.controller.removeFailedNode(message.nodeId);
        return {};
      }
      case ControllerCommand.replaceFailedNode: {
        const success = await this.driver.controller.replaceFailedNode(
          message.nodeId,
          (await processInclusionOptions(
            this.clientsController,
            this.client,
            message,
          )) as ReplaceNodeOptions,
        );
        return { success };
      }
      // Schema <= 31
      case ControllerCommand.healNode:
      case ControllerCommand.rebuildNodeRoutes: {
        const success = await this.driver.controller.rebuildNodeRoutes(
          message.nodeId,
        );
        return { success };
      }
      // Schema <= 31
      case ControllerCommand.beginHealingNetwork: {
        const success = this.driver.controller.beginRebuildingRoutes();
        return { success };
      }
      // Schema >= 32
      case ControllerCommand.beginRebuildingRoutes: {
        const success = this.driver.controller.beginRebuildingRoutes(
          message.options!,
        );
        return { success };
      }
      // Schema <= 31
      case ControllerCommand.stopHealingNetwork:
      // Schema >= 32
      case ControllerCommand.stopRebuildingRoutes: {
        const success = this.driver.controller.stopRebuildingRoutes();
        return { success };
      }
      case ControllerCommand.isFailedNode: {
        const failed = await this.driver.controller.isFailedNode(
          message.nodeId,
        );
        return { failed };
      }
      case ControllerCommand.getAssociationGroups: {
        const groups: ControllerResultTypes[ControllerCommand.getAssociationGroups]["groups"] =
          {};
        this.driver.controller
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
        this.driver.controller
          .getAssociations({
            nodeId: message.nodeId,
            endpoint: message.endpoint,
          })
          .forEach((value, key) => (associations[key] = value));
        return { associations };
      }
      case ControllerCommand.checkAssociation: {
        const result = this.driver.controller.checkAssociation(
          { nodeId: message.nodeId, endpoint: message.endpoint },
          message.group,
          message.association,
        );
        return { result };
      }
      case ControllerCommand.isAssociationAllowed: {
        const result = this.driver.controller.checkAssociation(
          { nodeId: message.nodeId, endpoint: message.endpoint },
          message.group,
          message.association,
        );
        return { allowed: result === AssociationCheckResult.OK };
      }
      case ControllerCommand.addAssociations: {
        await this.driver.controller.addAssociations(
          { nodeId: message.nodeId, endpoint: message.endpoint },
          message.group,
          message.associations,
        );
        return {};
      }
      case ControllerCommand.removeAssociations: {
        await this.driver.controller.removeAssociations(
          { nodeId: message.nodeId, endpoint: message.endpoint },
          message.group,
          message.associations,
        );
        return {};
      }
      case ControllerCommand.removeNodeFromAllAssocations:
      case ControllerCommand.removeNodeFromAllAssociations: {
        await this.driver.controller.removeNodeFromAllAssociations(
          message.nodeId,
        );
        return {};
      }
      case ControllerCommand.getNodeNeighbors: {
        const neighbors = await this.driver.controller.getNodeNeighbors(
          message.nodeId,
        );
        return { neighbors };
      }
      case ControllerCommand.supportsFeature: {
        const supported = this.driver.controller.supportsFeature(
          message.feature,
        );
        return { supported };
      }
      case ControllerCommand.backupNVMRaw: {
        const nvmDataRaw = await this.driver.controller.backupNVMRaw(
          (bytesRead: number, total: number) => {
            this.clientsController.clients.forEach((client) =>
              client.sendEvent({
                source: "controller",
                event: "nvm backup progress",
                bytesRead,
                total,
              }),
            );
          },
        );
        return { nvmData: Buffer.from(nvmDataRaw.buffer).toString("base64") };
      }
      case ControllerCommand.restoreNVM: {
        const nvmData = Buffer.from(message.nvmData, "base64");
        await this.driver.controller.restoreNVM(
          nvmData,
          (bytesRead: number, total: number) => {
            this.clientsController.clients.forEach((client) =>
              client.sendEvent({
                source: "controller",
                event: "nvm convert progress",
                bytesRead,
                total,
              }),
            );
          },
          (bytesWritten: number, total: number) => {
            this.clientsController.clients.forEach((client) =>
              client.sendEvent({
                source: "controller",
                event: "nvm restore progress",
                bytesWritten,
                total,
              }),
            );
          },
          message.migrateOptions,
        );
        return {};
      }
      case ControllerCommand.setRFRegion: {
        const success = await this.driver.controller.setRFRegion(
          message.region,
        );
        return { success };
      }
      case ControllerCommand.getRFRegion: {
        const region = await this.driver.controller.getRFRegion();
        return { region };
      }
      case ControllerCommand.toggleRF: {
        const success = await this.driver.controller.toggleRF(message.enabled);
        return { success };
      }
      case ControllerCommand.setPowerlevel: {
        const success = await this.driver.controller.setPowerlevel(
          message.powerlevel,
          message.measured0dBm,
        );
        return { success };
      }
      case ControllerCommand.getPowerlevel: {
        return await this.driver.controller.getPowerlevel();
      }
      case ControllerCommand.getState: {
        const state = dumpController(this.driver, this.client.schemaVersion);
        return { state };
      }
      case ControllerCommand.getKnownLifelineRoutes: {
        const routes = this.driver.controller.getKnownLifelineRoutes();
        return { routes };
      }
      case ControllerCommand.getAnyFirmwareUpdateProgress:
      case ControllerCommand.isAnyOTAFirmwareUpdateInProgress: {
        return {
          progress: this.driver.controller.isAnyOTAFirmwareUpdateInProgress(),
        };
      }
      case ControllerCommand.getAvailableFirmwareUpdates: {
        return {
          updates: await this.driver.controller.getAvailableFirmwareUpdates(
            message.nodeId,
            getFirmwareUpdateOptions(message, this.client),
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
        const result = await this.driver.controller.firmwareUpdateOTA(
          message.nodeId,
          message.updateInfo,
        );
        return firmwareUpdateOutgoingMessage(result, this.client.schemaVersion);
      }
      case ControllerCommand.firmwareUpdateOTW: {
        const file = Buffer.from(message.file, "base64");
        const parsed = parseFirmwareFile(
          message.filename,
          file,
          message.fileFormat,
        );
        const { data } = await extractFirmware(parsed.rawData, parsed.format);
        const result = await this.driver.firmwareUpdateOTW(data);
        return firmwareUpdateOutgoingMessage(result, this.client.schemaVersion);
      }
      case ControllerCommand.isFirmwareUpdateInProgress: {
        const progress = this.driver.isOTWFirmwareUpdateInProgress();
        return { progress };
      }
      case ControllerCommand.setMaxLongRangePowerlevel: {
        const success = await this.driver.controller.setMaxLongRangePowerlevel(
          message.limit,
        );
        return { success };
      }
      case ControllerCommand.getMaxLongRangePowerlevel: {
        const limit = await this.driver.controller.getMaxLongRangePowerlevel();
        return {
          limit,
        };
      }
      case ControllerCommand.setLongRangeChannel: {
        const success = await this.driver.controller.setLongRangeChannel(
          message.channel,
        );
        return { success };
      }
      case ControllerCommand.getLongRangeChannel: {
        const response = await this.driver.controller.getLongRangeChannel();
        return response;
      }
      case ControllerCommand.getAllAvailableFirmwareUpdates: {
        return {
          updates: await this.driver.controller.getAllAvailableFirmwareUpdates(
            getFirmwareUpdateOptions(message, this.client),
          ),
        };
      }
      // Routing operations
      case ControllerCommand.assignReturnRoutes: {
        const success = await this.driver.controller.assignReturnRoutes(
          message.nodeId,
          message.destinationNodeId,
        );
        return { success };
      }
      case ControllerCommand.deleteReturnRoutes: {
        const success = await this.driver.controller.deleteReturnRoutes(
          message.nodeId,
        );
        return { success };
      }
      case ControllerCommand.assignSUCReturnRoutes: {
        const success = await this.driver.controller.assignSUCReturnRoutes(
          message.nodeId,
        );
        return { success };
      }
      case ControllerCommand.deleteSUCReturnRoutes: {
        const success = await this.driver.controller.deleteSUCReturnRoutes(
          message.nodeId,
        );
        return { success };
      }
      case ControllerCommand.assignPriorityReturnRoute: {
        const success = await this.driver.controller.assignPriorityReturnRoute(
          message.nodeId,
          message.destinationNodeId,
          message.repeaters,
          message.routeSpeed,
        );
        return { success };
      }
      case ControllerCommand.assignPrioritySUCReturnRoute: {
        const success =
          await this.driver.controller.assignPrioritySUCReturnRoute(
            message.nodeId,
            message.repeaters,
            message.routeSpeed,
          );
        return { success };
      }
      case ControllerCommand.assignCustomReturnRoutes: {
        const success = await this.driver.controller.assignCustomReturnRoutes(
          message.nodeId,
          message.destinationNodeId,
          message.routes,
          message.priorityRoute,
        );
        return { success };
      }
      case ControllerCommand.assignCustomSUCReturnRoutes: {
        const success =
          await this.driver.controller.assignCustomSUCReturnRoutes(
            message.nodeId,
            message.routes,
            message.priorityRoute,
          );
        return { success };
      }
      case ControllerCommand.setPriorityRoute: {
        const success = await this.driver.controller.setPriorityRoute(
          message.destinationNodeId,
          message.repeaters,
          message.routeSpeed,
        );
        return { success };
      }
      case ControllerCommand.removePriorityRoute: {
        const success = await this.driver.controller.removePriorityRoute(
          message.destinationNodeId,
        );
        return { success };
      }
      case ControllerCommand.getPriorityRoute: {
        const route = await this.driver.controller.getPriorityRoute(
          message.destinationNodeId,
        );
        return { route };
      }
      case ControllerCommand.discoverNodeNeighbors: {
        const success = await this.driver.controller.discoverNodeNeighbors(
          message.nodeId,
        );
        return { success };
      }
      // Diagnostics
      case ControllerCommand.getBackgroundRSSI: {
        return await this.driver.controller.getBackgroundRSSI();
      }
      // Long Range
      case ControllerCommand.getLongRangeNodes: {
        const nodeIds = await this.driver.controller.getLongRangeNodes();
        return { nodeIds };
      }
      // Controller identification
      case ControllerCommand.getDSK: {
        const dskBytes = await this.driver.controller.getDSK();
        return { dsk: Buffer.from(dskBytes).toString("base64") };
      }
      // NVM operations
      case ControllerCommand.getNVMId: {
        const nvmId = await this.driver.controller.getNVMId();
        return { nvmId };
      }
      case ControllerCommand.externalNVMOpen: {
        const size = await this.driver.controller.externalNVMOpen();
        return { size };
      }
      case ControllerCommand.externalNVMClose: {
        await this.driver.controller.externalNVMClose();
        return {};
      }
      case ControllerCommand.externalNVMReadByte: {
        const byte = await this.driver.controller.externalNVMReadByte(
          message.offset,
        );
        return { byte };
      }
      case ControllerCommand.externalNVMWriteByte: {
        const success = await this.driver.controller.externalNVMWriteByte(
          message.offset,
          message.data,
        );
        return { success };
      }
      case ControllerCommand.externalNVMReadBuffer: {
        const bufferData = await this.driver.controller.externalNVMReadBuffer(
          message.offset,
          message.length,
        );
        return { buffer: Buffer.from(bufferData).toString("base64") };
      }
      case ControllerCommand.externalNVMWriteBuffer: {
        const buffer = Buffer.from(message.buffer, "base64");
        const success = await this.driver.controller.externalNVMWriteBuffer(
          message.offset,
          buffer,
        );
        return { success };
      }
      case ControllerCommand.externalNVMReadBuffer700: {
        const result = await this.driver.controller.externalNVMReadBuffer700(
          message.offset,
          message.length,
        );
        return {
          buffer: Buffer.from(result.buffer).toString("base64"),
          endOfFile: result.endOfFile,
        };
      }
      case ControllerCommand.externalNVMWriteBuffer700: {
        const buffer = Buffer.from(message.buffer, "base64");
        const result = await this.driver.controller.externalNVMWriteBuffer700(
          message.offset,
          buffer,
        );
        return { endOfFile: result.endOfFile };
      }
      case ControllerCommand.externalNVMOpenExt: {
        const result = await this.driver.controller.externalNVMOpenExt();
        return {
          size: result.size,
          supportedOperations: result.supportedOperations,
        };
      }
      case ControllerCommand.externalNVMCloseExt: {
        await this.driver.controller.externalNVMCloseExt();
        return {};
      }
      case ControllerCommand.externalNVMReadBufferExt: {
        const result = await this.driver.controller.externalNVMReadBufferExt(
          message.offset,
          message.length,
        );
        return {
          buffer: Buffer.from(result.buffer).toString("base64"),
          endOfFile: result.endOfFile,
        };
      }
      case ControllerCommand.externalNVMWriteBufferExt: {
        const buffer = Buffer.from(message.buffer, "base64");
        const result = await this.driver.controller.externalNVMWriteBufferExt(
          message.offset,
          buffer,
        );
        return { endOfFile: result.endOfFile };
      }
      // Watchdog operations
      case ControllerCommand.startWatchdog: {
        const success = await this.driver.controller.startWatchdog();
        return { success };
      }
      case ControllerCommand.stopWatchdog: {
        const success = await this.driver.controller.stopWatchdog();
        return { success };
      }
      // RF region extended
      case ControllerCommand.querySupportedRFRegions: {
        const regions = await this.driver.controller.querySupportedRFRegions();
        return { regions };
      }
      case ControllerCommand.queryRFRegionInfo: {
        const result = await this.driver.controller.queryRFRegionInfo(
          message.region,
        );
        return result;
      }
      // Network join/leave
      case ControllerCommand.beginJoiningNetwork: {
        const result = await this.driver.controller.beginJoiningNetwork({
          strategy: message.strategy ?? JoinNetworkStrategy.Default,
          userCallbacks: {
            showDSK: (dsk: string) => {
              this.clientsController.clients.forEach((client) =>
                client.sendEvent({
                  source: "controller",
                  event: "join network show dsk",
                  dsk,
                }),
              );
            },
            done: () => {
              this.clientsController.clients.forEach((client) =>
                client.sendEvent({
                  source: "controller",
                  event: "join network done",
                }),
              );
            },
          },
        });
        return { result };
      }
      case ControllerCommand.stopJoiningNetwork: {
        const success = await this.driver.controller.stopJoiningNetwork();
        return { success };
      }
      case ControllerCommand.beginLeavingNetwork: {
        const result = await this.driver.controller.beginLeavingNetwork();
        return { result };
      }
      case ControllerCommand.stopLeavingNetwork: {
        const success = await this.driver.controller.stopLeavingNetwork();
        return { success };
      }
      // Cached route queries
      case ControllerCommand.getPriorityReturnRouteCached: {
        const route = this.driver.controller.getPriorityReturnRouteCached(
          message.nodeId,
          message.destinationNodeId,
        );
        return { route };
      }
      case ControllerCommand.getPriorityReturnRoutesCached: {
        const routes = this.driver.controller.getPriorityReturnRoutesCached(
          message.nodeId,
        );
        return { routes };
      }
      case ControllerCommand.getPrioritySUCReturnRouteCached: {
        const route = this.driver.controller.getPrioritySUCReturnRouteCached(
          message.nodeId,
        );
        return { route };
      }
      case ControllerCommand.getCustomReturnRoutesCached: {
        const routes = this.driver.controller.getCustomReturnRoutesCached(
          message.nodeId,
          message.destinationNodeId,
        );
        return { routes };
      }
      case ControllerCommand.getCustomSUCReturnRoutesCached: {
        const routes = this.driver.controller.getCustomSUCReturnRoutesCached(
          message.nodeId,
        );
        return { routes };
      }
      // Association queries (all endpoints)
      case ControllerCommand.getAllAssociationGroups: {
        const groups = this.driver.controller.getAllAssociationGroups(
          message.nodeId,
        );
        return { groups };
      }
      case ControllerCommand.getAllAssociations: {
        const associations = new Map<
          number,
          Map<number, ReadonlyMap<number, readonly AssociationAddress[]>>
        >();
        this.driver.controller
          .getAllAssociations(message.nodeId)
          .forEach((groupAssociations, source) => {
            let endpointMap = associations.get(source.nodeId);
            if (!endpointMap) {
              endpointMap = new Map();
              associations.set(source.nodeId, endpointMap);
            }
            endpointMap.set(source.endpoint ?? 0, groupAssociations);
          });
        return { associations };
      }
      // RF region info (cached)
      case ControllerCommand.getSupportedRFRegions: {
        const regions = this.driver.controller.getSupportedRFRegions(
          message.filterSubsets,
        );
        return { regions: regions ? [...regions] : undefined };
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

async function processInclusionOptions(
  clientsController: ClientsController,
  client: Client,
  message:
    | IncomingCommandControllerBeginInclusion
    | IncomingCommandControllerBeginInclusionLegacy
    | IncomingCommandControllerReplaceFailedNode
    | IncomingCommandControllerReplaceFailedNodeLegacy,
): Promise<InclusionOptions | ReplaceNodeOptions> {
  // Schema 8+ inclusion handling
  if ("options" in message) {
    const options = message.options;
    if (
      options.strategy === InclusionStrategy.Default ||
      options.strategy === InclusionStrategy.Security_S2
    ) {
      // When using Security_S2 inclusion, the user can either provide the provisioning details ahead
      // of time or go through a standard inclusion process and let the this.driver/client prompt them
      // for provisioning details based on information received from the device. We have to handle
      // each scenario separately.
      if ("provisioning" in options) {
        // There are three input options when providing provisioning details ahead of time:
        // PlannedProvisioningEntry, QRProvisioningInformation, or a QR code string which the server
        // will automatically parse into a QRProvisioningInformation object before proceeding with the
        // inclusion process
        if (typeof options.provisioning === "string") {
          options.provisioning = await parseQRCodeString(options.provisioning);
        }
      } else {
        // @ts-expect-error for some reason, TS doesn't understand that
        // the default and S2 strategies always accept either a provisioning
        // entry or the user callbacks
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

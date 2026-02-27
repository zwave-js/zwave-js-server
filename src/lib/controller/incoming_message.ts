import {
  AssociationAddress,
  ExclusionOptions,
  ExclusionStrategy,
  FirmwareFileFormat,
  FirmwareUpdateFileInfo,
  FirmwareUpdateInfo,
  InclusionGrant,
  InclusionOptions,
  JoinNetworkStrategy,
  KEXFailType,
  MigrateNVMOptions,
  PlannedProvisioningEntry,
  RebuildRoutesOptions,
  ReplaceNodeOptions,
  RFRegion,
  ZWaveFeature,
} from "zwave-js";
import { Route, ZWaveDataRate } from "@zwave-js/core";
import type { QRProvisioningInformation } from "@zwave-js/core";
import { IncomingCommandBase } from "../incoming_message_base.js";
import { ControllerCommand } from "./command.js";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IncomingCommandControllerBase extends IncomingCommandBase {}

// Schema >= 8
export interface IncomingCommandControllerBeginInclusion
  extends IncomingCommandControllerBase {
  command: ControllerCommand.beginInclusion;
  options: InclusionOptions;
}

// Schema <= 7
export interface IncomingCommandControllerBeginInclusionLegacy
  extends IncomingCommandControllerBase {
  command: ControllerCommand.beginInclusion;
  includeNonSecure?: boolean;
}

export interface IncomingCommandControllerStopInclusion
  extends IncomingCommandControllerBase {
  command: ControllerCommand.stopInclusion;
}

export interface IncomingCommandControllerCancelSecureBootstrapS2
  extends IncomingCommandControllerBase {
  command: ControllerCommand.cancelSecureBootstrapS2;
  reason: KEXFailType;
}

export interface IncomingCommandControllerBeginExclusion // schema >=29
  extends IncomingCommandControllerBase {
  command: ControllerCommand.beginExclusion;
  options?: ExclusionOptions;
}

export interface IncomingCommandControllerBeginExclusionLegacy // schema < 29
  extends IncomingCommandControllerBase {
  command: ControllerCommand.beginExclusion;
  unprovision?: boolean | "inactive";
  strategy?: ExclusionStrategy;
}

export interface IncomingCommandControllerStopExclusion
  extends IncomingCommandControllerBase {
  command: ControllerCommand.stopExclusion;
}

export interface IncomingCommandControllerRemoveFailedNode
  extends IncomingCommandControllerBase {
  command: ControllerCommand.removeFailedNode;
  nodeId: number;
}

// Schema >= 8
export interface IncomingCommandControllerReplaceFailedNode
  extends IncomingCommandControllerBase {
  command: ControllerCommand.replaceFailedNode;
  nodeId: number;
  options: ReplaceNodeOptions;
}

// Schema <= 7
export interface IncomingCommandControllerReplaceFailedNodeLegacy
  extends IncomingCommandControllerBase {
  command: ControllerCommand.replaceFailedNode;
  nodeId: number;
  includeNonSecure?: boolean;
}

// Schema <= 31
export interface IncomingCommandControllerHealNode
  extends IncomingCommandControllerBase {
  command: ControllerCommand.healNode;
  nodeId: number;
}

// Schema >= 32
export interface IncomingCommandControllerRebuildNodeRoutes
  extends IncomingCommandControllerBase {
  command: ControllerCommand.rebuildNodeRoutes;
  nodeId: number;
}

// Schema <= 31
export interface IncomingCommandControllerBeginHealingNetwork
  extends IncomingCommandControllerBase {
  command: ControllerCommand.beginHealingNetwork;
}

// Schema >= 32
export interface IncomingCommandControllerBeginRebuildingRoutes
  extends IncomingCommandControllerBase {
  command: ControllerCommand.beginRebuildingRoutes;
  options?: RebuildRoutesOptions;
}

// Schema <= 31
export interface IncomingCommandControllerStopHealingNetwork
  extends IncomingCommandControllerBase {
  command: ControllerCommand.stopHealingNetwork;
}

// Schema >= 32
export interface IncomingCommandControllerStopRebuildingRoutes
  extends IncomingCommandControllerBase {
  command: ControllerCommand.stopRebuildingRoutes;
}

export interface IncomingCommandControllerIsFailedNode
  extends IncomingCommandControllerBase {
  command: ControllerCommand.isFailedNode;
  nodeId: number;
}

export interface IncomingCommandControllerGetAssociationGroups
  extends IncomingCommandControllerBase {
  command: ControllerCommand.getAssociationGroups;
  nodeId: number;
  endpoint?: number;
}

export interface IncomingCommandControllerGetAssociations
  extends IncomingCommandControllerBase {
  command: ControllerCommand.getAssociations;
  nodeId: number;
  endpoint?: number;
}

export interface IncomingCommandControllerCheckAssociation
  extends IncomingCommandControllerBase {
  command: ControllerCommand.checkAssociation;
  nodeId: number;
  group: number;
  association: AssociationAddress;
  endpoint?: number;
}

export interface IncomingCommandControllerIsAssociationAllowed
  extends IncomingCommandControllerBase {
  command: ControllerCommand.isAssociationAllowed;
  nodeId: number;
  group: number;
  association: AssociationAddress;
  endpoint?: number;
}

export interface IncomingCommandControllerAddAssociations
  extends IncomingCommandControllerBase {
  command: ControllerCommand.addAssociations;
  nodeId: number;
  group: number;
  associations: AssociationAddress[];
  endpoint?: number;
}

export interface IncomingCommandControllerRemoveAssociations
  extends IncomingCommandControllerBase {
  command: ControllerCommand.removeAssociations;
  nodeId: number;
  group: number;
  associations: AssociationAddress[];
  endpoint?: number;
}
export interface IncomingCommandControllerRemoveNodeFromAllAssociations
  extends IncomingCommandControllerBase {
  command:
    | ControllerCommand.removeNodeFromAllAssociations
    | ControllerCommand.removeNodeFromAllAssocations;
  nodeId: number;
}

export interface IncomingCommandControllerGetNodeNeighbors
  extends IncomingCommandControllerBase {
  command: ControllerCommand.getNodeNeighbors;
  nodeId: number;
}

export interface IncomingCommandControllerGrantSecurityClasses
  extends IncomingCommandControllerBase {
  command: ControllerCommand.grantSecurityClasses;
  inclusionGrant: InclusionGrant;
}

export interface IncomingCommandControllerValidateDSKAndEnterPIN
  extends IncomingCommandControllerBase {
  command: ControllerCommand.validateDSKAndEnterPIN;
  pin: string;
}

export interface IncomingCommandControllerProvisionSmartStartNode
  extends IncomingCommandControllerBase {
  command: ControllerCommand.provisionSmartStartNode;
  entry: PlannedProvisioningEntry | string | QRProvisioningInformation;
}

export interface IncomingCommandControllerUnprovisionSmartStartNode
  extends IncomingCommandControllerBase {
  command: ControllerCommand.unprovisionSmartStartNode;
  dskOrNodeId: string | number;
}

export interface IncomingCommandControllerGetProvisioningEntry
  extends IncomingCommandControllerBase {
  command: ControllerCommand.getProvisioningEntry;
  // schema version < 17
  dsk?: string;
  // schema version > 16
  dskOrNodeId?: string | number;
}

export interface IncomingCommandControllerGetProvisioningEntries
  extends IncomingCommandControllerBase {
  command: ControllerCommand.getProvisioningEntries;
}

export interface IncomingCommandControllerSupportsFeature
  extends IncomingCommandControllerBase {
  command: ControllerCommand.supportsFeature;
  feature: ZWaveFeature;
}

export interface IncomingCommandControllerBackupNVMRaw
  extends IncomingCommandControllerBase {
  command: ControllerCommand.backupNVMRaw;
}

export interface IncomingCommandControllerRestoreNVM
  extends IncomingCommandControllerBase {
  command: ControllerCommand.restoreNVM;
  nvmData: string; // base64 encoded
  migrateOptions?: MigrateNVMOptions;
}

export interface IncomingCommandControllerRestoreNVMRaw
  extends IncomingCommandControllerBase {
  command: ControllerCommand.restoreNVMRaw;
  nvmData: string; // base64 encoded
}

export interface IncomingCommandControllerSetRFRegion
  extends IncomingCommandControllerBase {
  command: ControllerCommand.setRFRegion;
  region: RFRegion;
}

export interface IncomingCommandControllerGetRFRegion
  extends IncomingCommandControllerBase {
  command: ControllerCommand.getRFRegion;
}

export interface IncomingCommandControllerToggleRF
  extends IncomingCommandControllerBase {
  command: ControllerCommand.toggleRF;
  enabled: boolean;
}

export interface IncomingCommandControllerSetPowerlevel
  extends IncomingCommandControllerBase {
  command: ControllerCommand.setPowerlevel;
  powerlevel: number;
  measured0dBm: number;
}

export interface IncomingCommandControllerGetPowerlevel
  extends IncomingCommandControllerBase {
  command: ControllerCommand.getPowerlevel;
}
export interface IncomingCommandControllerGetState
  extends IncomingCommandControllerBase {
  command: ControllerCommand.getState;
}

export interface IncomingCommandControllerGetKnownLifelineRoutes
  extends IncomingCommandControllerBase {
  command: ControllerCommand.getKnownLifelineRoutes;
}

export interface IncomingCommandControllerIsAnyOTAFirmwareUpdateInProgress
  extends IncomingCommandControllerBase {
  command:
    | ControllerCommand.isAnyOTAFirmwareUpdateInProgress
    | ControllerCommand.getAnyFirmwareUpdateProgress;
}

export interface IncomingCommandControllerGetAvailableFirmwareUpdates
  extends IncomingCommandControllerBase {
  command: ControllerCommand.getAvailableFirmwareUpdates;
  nodeId: number;
  apiKey?: string;
  includePrereleases?: boolean;
  rfRegion?: RFRegion;
}

// Schema <= 23 - no longer supported due to a breaking change upstream
export interface IncomingCommandControllerBeginOTAFirmwareUpdate
  extends IncomingCommandControllerBase {
  command: ControllerCommand.beginOTAFirmwareUpdate;
  nodeId: number;
  update: FirmwareUpdateFileInfo;
}

// Schema > 23
export interface IncomingCommandControllerFirmwareUpdateOTA
  extends IncomingCommandControllerBase {
  command: ControllerCommand.firmwareUpdateOTA;
  nodeId: number;
  updates?: FirmwareUpdateFileInfo[];
  updateInfo?: FirmwareUpdateInfo;
}

export interface IncomingCommandControllerFirmwareUpdateOTW
  extends IncomingCommandControllerBase {
  command: ControllerCommand.firmwareUpdateOTW;
  filename: string;
  file: string; // use base64 encoding for the file
  fileFormat?: FirmwareFileFormat;
}

export interface IncomingCommandIsFirmwareUpdateInProgress
  extends IncomingCommandControllerBase {
  command: ControllerCommand.isFirmwareUpdateInProgress;
}

export interface IncomingCommandControllerSetMaxLongRangePowerlevel
  extends IncomingCommandControllerBase {
  command: ControllerCommand.setMaxLongRangePowerlevel;
  limit: number;
}

export interface IncomingCommandControllerGetMaxLongRangePowerlevel
  extends IncomingCommandControllerBase {
  command: ControllerCommand.getMaxLongRangePowerlevel;
}

export interface IncomingCommandControllerSetLongRangeChannel
  extends IncomingCommandControllerBase {
  command: ControllerCommand.setLongRangeChannel;
  channel: number;
}

export interface IncomingCommandControllerGetLongRangeChannel
  extends IncomingCommandControllerBase {
  command: ControllerCommand.getLongRangeChannel;
}

export interface IncomingCommandControllerGetAllAvailableFirmwareUpdates
  extends IncomingCommandControllerBase {
  command: ControllerCommand.getAllAvailableFirmwareUpdates;
  apiKey?: string;
  includePrereleases?: boolean;
  rfRegion?: RFRegion;
}

// Routing operations
export interface IncomingCommandControllerAssignReturnRoutes
  extends IncomingCommandControllerBase {
  command: ControllerCommand.assignReturnRoutes;
  nodeId: number;
  destinationNodeId: number;
}

export interface IncomingCommandControllerDeleteReturnRoutes
  extends IncomingCommandControllerBase {
  command: ControllerCommand.deleteReturnRoutes;
  nodeId: number;
}

export interface IncomingCommandControllerAssignSUCReturnRoutes
  extends IncomingCommandControllerBase {
  command: ControllerCommand.assignSUCReturnRoutes;
  nodeId: number;
}

export interface IncomingCommandControllerDeleteSUCReturnRoutes
  extends IncomingCommandControllerBase {
  command: ControllerCommand.deleteSUCReturnRoutes;
  nodeId: number;
}

export interface IncomingCommandControllerAssignPriorityReturnRoute
  extends IncomingCommandControllerBase {
  command: ControllerCommand.assignPriorityReturnRoute;
  nodeId: number;
  destinationNodeId: number;
  repeaters: number[];
  routeSpeed: ZWaveDataRate;
}

export interface IncomingCommandControllerAssignPrioritySUCReturnRoute
  extends IncomingCommandControllerBase {
  command: ControllerCommand.assignPrioritySUCReturnRoute;
  nodeId: number;
  repeaters: number[];
  routeSpeed: ZWaveDataRate;
}

export interface IncomingCommandControllerAssignCustomReturnRoutes
  extends IncomingCommandControllerBase {
  command: ControllerCommand.assignCustomReturnRoutes;
  nodeId: number;
  destinationNodeId: number;
  routes: Route[];
  priorityRoute?: Route;
}

export interface IncomingCommandControllerAssignCustomSUCReturnRoutes
  extends IncomingCommandControllerBase {
  command: ControllerCommand.assignCustomSUCReturnRoutes;
  nodeId: number;
  routes: Route[];
  priorityRoute?: Route;
}

export interface IncomingCommandControllerSetPriorityRoute
  extends IncomingCommandControllerBase {
  command: ControllerCommand.setPriorityRoute;
  destinationNodeId: number;
  repeaters: number[];
  routeSpeed: ZWaveDataRate;
}

export interface IncomingCommandControllerRemovePriorityRoute
  extends IncomingCommandControllerBase {
  command: ControllerCommand.removePriorityRoute;
  destinationNodeId: number;
}

export interface IncomingCommandControllerGetPriorityRoute
  extends IncomingCommandControllerBase {
  command: ControllerCommand.getPriorityRoute;
  destinationNodeId: number;
}

export interface IncomingCommandControllerDiscoverNodeNeighbors
  extends IncomingCommandControllerBase {
  command: ControllerCommand.discoverNodeNeighbors;
  nodeId: number;
}

// Diagnostics
export interface IncomingCommandControllerGetBackgroundRSSI
  extends IncomingCommandControllerBase {
  command: ControllerCommand.getBackgroundRSSI;
}

// Long Range
export interface IncomingCommandControllerGetLongRangeNodes
  extends IncomingCommandControllerBase {
  command: ControllerCommand.getLongRangeNodes;
}

// Controller identification
export interface IncomingCommandControllerGetDSK
  extends IncomingCommandControllerBase {
  command: ControllerCommand.getDSK;
}

// NVM operations
export interface IncomingCommandControllerGetNVMId
  extends IncomingCommandControllerBase {
  command: ControllerCommand.getNVMId;
}

export interface IncomingCommandControllerExternalNVMOpen
  extends IncomingCommandControllerBase {
  command: ControllerCommand.externalNVMOpen;
}

export interface IncomingCommandControllerExternalNVMClose
  extends IncomingCommandControllerBase {
  command: ControllerCommand.externalNVMClose;
}

export interface IncomingCommandControllerExternalNVMReadByte
  extends IncomingCommandControllerBase {
  command: ControllerCommand.externalNVMReadByte;
  offset: number;
}

export interface IncomingCommandControllerExternalNVMWriteByte
  extends IncomingCommandControllerBase {
  command: ControllerCommand.externalNVMWriteByte;
  offset: number;
  data: number;
}

export interface IncomingCommandControllerExternalNVMReadBuffer
  extends IncomingCommandControllerBase {
  command: ControllerCommand.externalNVMReadBuffer;
  offset: number;
  length: number;
}

export interface IncomingCommandControllerExternalNVMWriteBuffer
  extends IncomingCommandControllerBase {
  command: ControllerCommand.externalNVMWriteBuffer;
  offset: number;
  buffer: string; // base64 encoded
}

export interface IncomingCommandControllerExternalNVMReadBuffer700
  extends IncomingCommandControllerBase {
  command: ControllerCommand.externalNVMReadBuffer700;
  offset: number;
  length: number;
}

export interface IncomingCommandControllerExternalNVMWriteBuffer700
  extends IncomingCommandControllerBase {
  command: ControllerCommand.externalNVMWriteBuffer700;
  offset: number;
  buffer: string; // base64 encoded
}

export interface IncomingCommandControllerExternalNVMOpenExt
  extends IncomingCommandControllerBase {
  command: ControllerCommand.externalNVMOpenExt;
}

export interface IncomingCommandControllerExternalNVMCloseExt
  extends IncomingCommandControllerBase {
  command: ControllerCommand.externalNVMCloseExt;
}

export interface IncomingCommandControllerExternalNVMReadBufferExt
  extends IncomingCommandControllerBase {
  command: ControllerCommand.externalNVMReadBufferExt;
  offset: number;
  length: number;
}

export interface IncomingCommandControllerExternalNVMWriteBufferExt
  extends IncomingCommandControllerBase {
  command: ControllerCommand.externalNVMWriteBufferExt;
  offset: number;
  buffer: string; // base64 encoded
}

// Watchdog operations
export interface IncomingCommandControllerStartWatchdog
  extends IncomingCommandControllerBase {
  command: ControllerCommand.startWatchdog;
}

export interface IncomingCommandControllerStopWatchdog
  extends IncomingCommandControllerBase {
  command: ControllerCommand.stopWatchdog;
}

// RF region extended
export interface IncomingCommandControllerQuerySupportedRFRegions
  extends IncomingCommandControllerBase {
  command: ControllerCommand.querySupportedRFRegions;
}

export interface IncomingCommandControllerQueryRFRegionInfo
  extends IncomingCommandControllerBase {
  command: ControllerCommand.queryRFRegionInfo;
  region: RFRegion;
}

// Network join/leave
export interface IncomingCommandControllerBeginJoiningNetwork
  extends IncomingCommandControllerBase {
  command: ControllerCommand.beginJoiningNetwork;
  strategy?: JoinNetworkStrategy;
}

export interface IncomingCommandControllerStopJoiningNetwork
  extends IncomingCommandControllerBase {
  command: ControllerCommand.stopJoiningNetwork;
}

export interface IncomingCommandControllerBeginLeavingNetwork
  extends IncomingCommandControllerBase {
  command: ControllerCommand.beginLeavingNetwork;
}

export interface IncomingCommandControllerStopLeavingNetwork
  extends IncomingCommandControllerBase {
  command: ControllerCommand.stopLeavingNetwork;
}

// Cached route queries
export interface IncomingCommandControllerGetPriorityReturnRouteCached
  extends IncomingCommandControllerBase {
  command: ControllerCommand.getPriorityReturnRouteCached;
  nodeId: number;
  destinationNodeId: number;
}

export interface IncomingCommandControllerGetPriorityReturnRoutesCached
  extends IncomingCommandControllerBase {
  command: ControllerCommand.getPriorityReturnRoutesCached;
  nodeId: number;
}

export interface IncomingCommandControllerGetPrioritySUCReturnRouteCached
  extends IncomingCommandControllerBase {
  command: ControllerCommand.getPrioritySUCReturnRouteCached;
  nodeId: number;
}

export interface IncomingCommandControllerGetCustomReturnRoutesCached
  extends IncomingCommandControllerBase {
  command: ControllerCommand.getCustomReturnRoutesCached;
  nodeId: number;
  destinationNodeId: number;
}

export interface IncomingCommandControllerGetCustomSUCReturnRoutesCached
  extends IncomingCommandControllerBase {
  command: ControllerCommand.getCustomSUCReturnRoutesCached;
  nodeId: number;
}

// Association queries (all endpoints)
export interface IncomingCommandControllerGetAllAssociationGroups
  extends IncomingCommandControllerBase {
  command: ControllerCommand.getAllAssociationGroups;
  nodeId: number;
}

export interface IncomingCommandControllerGetAllAssociations
  extends IncomingCommandControllerBase {
  command: ControllerCommand.getAllAssociations;
  nodeId: number;
}

// RF region info
export interface IncomingCommandControllerGetSupportedRFRegions
  extends IncomingCommandControllerBase {
  command: ControllerCommand.getSupportedRFRegions;
  filterSubsets?: boolean;
}

export type IncomingMessageController =
  | IncomingCommandControllerBeginInclusion
  | IncomingCommandControllerBeginInclusionLegacy
  | IncomingCommandControllerStopInclusion
  | IncomingCommandControllerCancelSecureBootstrapS2
  | IncomingCommandControllerBeginExclusion
  | IncomingCommandControllerBeginExclusionLegacy
  | IncomingCommandControllerStopExclusion
  | IncomingCommandControllerRemoveFailedNode
  | IncomingCommandControllerReplaceFailedNode
  | IncomingCommandControllerReplaceFailedNodeLegacy
  | IncomingCommandControllerHealNode
  | IncomingCommandControllerRebuildNodeRoutes
  | IncomingCommandControllerBeginHealingNetwork
  | IncomingCommandControllerBeginRebuildingRoutes
  | IncomingCommandControllerStopHealingNetwork
  | IncomingCommandControllerStopRebuildingRoutes
  | IncomingCommandControllerIsFailedNode
  | IncomingCommandControllerGetAssociationGroups
  | IncomingCommandControllerGetAssociations
  | IncomingCommandControllerCheckAssociation
  | IncomingCommandControllerIsAssociationAllowed
  | IncomingCommandControllerAddAssociations
  | IncomingCommandControllerRemoveAssociations
  | IncomingCommandControllerRemoveNodeFromAllAssociations
  | IncomingCommandControllerGetNodeNeighbors
  | IncomingCommandControllerGrantSecurityClasses
  | IncomingCommandControllerValidateDSKAndEnterPIN
  | IncomingCommandControllerProvisionSmartStartNode
  | IncomingCommandControllerUnprovisionSmartStartNode
  | IncomingCommandControllerGetProvisioningEntry
  | IncomingCommandControllerGetProvisioningEntries
  | IncomingCommandControllerSupportsFeature
  | IncomingCommandControllerBackupNVMRaw
  | IncomingCommandControllerRestoreNVM
  | IncomingCommandControllerRestoreNVMRaw
  | IncomingCommandControllerSetRFRegion
  | IncomingCommandControllerGetRFRegion
  | IncomingCommandControllerToggleRF
  | IncomingCommandControllerSetPowerlevel
  | IncomingCommandControllerGetPowerlevel
  | IncomingCommandControllerGetState
  | IncomingCommandControllerGetKnownLifelineRoutes
  | IncomingCommandControllerIsAnyOTAFirmwareUpdateInProgress
  | IncomingCommandControllerGetAvailableFirmwareUpdates
  | IncomingCommandControllerBeginOTAFirmwareUpdate
  | IncomingCommandControllerFirmwareUpdateOTA
  | IncomingCommandControllerFirmwareUpdateOTW
  | IncomingCommandIsFirmwareUpdateInProgress
  | IncomingCommandControllerSetMaxLongRangePowerlevel
  | IncomingCommandControllerGetMaxLongRangePowerlevel
  | IncomingCommandControllerSetLongRangeChannel
  | IncomingCommandControllerGetLongRangeChannel
  | IncomingCommandControllerGetAllAvailableFirmwareUpdates
  | IncomingCommandControllerAssignReturnRoutes
  | IncomingCommandControllerDeleteReturnRoutes
  | IncomingCommandControllerAssignSUCReturnRoutes
  | IncomingCommandControllerDeleteSUCReturnRoutes
  | IncomingCommandControllerAssignPriorityReturnRoute
  | IncomingCommandControllerAssignPrioritySUCReturnRoute
  | IncomingCommandControllerAssignCustomReturnRoutes
  | IncomingCommandControllerAssignCustomSUCReturnRoutes
  | IncomingCommandControllerSetPriorityRoute
  | IncomingCommandControllerRemovePriorityRoute
  | IncomingCommandControllerGetPriorityRoute
  | IncomingCommandControllerDiscoverNodeNeighbors
  | IncomingCommandControllerGetBackgroundRSSI
  | IncomingCommandControllerGetLongRangeNodes
  | IncomingCommandControllerGetDSK
  | IncomingCommandControllerGetNVMId
  | IncomingCommandControllerExternalNVMOpen
  | IncomingCommandControllerExternalNVMClose
  | IncomingCommandControllerExternalNVMReadByte
  | IncomingCommandControllerExternalNVMWriteByte
  | IncomingCommandControllerExternalNVMReadBuffer
  | IncomingCommandControllerExternalNVMWriteBuffer
  | IncomingCommandControllerExternalNVMReadBuffer700
  | IncomingCommandControllerExternalNVMWriteBuffer700
  | IncomingCommandControllerExternalNVMOpenExt
  | IncomingCommandControllerExternalNVMCloseExt
  | IncomingCommandControllerExternalNVMReadBufferExt
  | IncomingCommandControllerExternalNVMWriteBufferExt
  | IncomingCommandControllerStartWatchdog
  | IncomingCommandControllerStopWatchdog
  | IncomingCommandControllerQuerySupportedRFRegions
  | IncomingCommandControllerQueryRFRegionInfo
  | IncomingCommandControllerBeginJoiningNetwork
  | IncomingCommandControllerStopJoiningNetwork
  | IncomingCommandControllerBeginLeavingNetwork
  | IncomingCommandControllerStopLeavingNetwork
  | IncomingCommandControllerGetPriorityReturnRouteCached
  | IncomingCommandControllerGetPriorityReturnRoutesCached
  | IncomingCommandControllerGetPrioritySUCReturnRouteCached
  | IncomingCommandControllerGetCustomReturnRoutesCached
  | IncomingCommandControllerGetCustomSUCReturnRoutesCached
  | IncomingCommandControllerGetAllAssociationGroups
  | IncomingCommandControllerGetAllAssociations
  | IncomingCommandControllerGetSupportedRFRegions;

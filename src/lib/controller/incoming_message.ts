import {
  AssociationAddress,
  ExclusionOptions,
  ExclusionStrategy,
  FirmwareFileFormat,
  FirmwareUpdateFileInfo,
  FirmwareUpdateInfo,
  InclusionGrant,
  InclusionOptions,
  PlannedProvisioningEntry,
  RebuildRoutesOptions,
  ReplaceNodeOptions,
  RFRegion,
  ZWaveFeature,
} from "zwave-js";
import type { QRProvisioningInformation } from "@zwave-js/core";
import { IncomingCommandBase } from "../incoming_message_base";
import { ControllerCommand } from "./command";

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
  nvmData: string;
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

export type IncomingMessageController =
  | IncomingCommandControllerBeginInclusion
  | IncomingCommandControllerBeginInclusionLegacy
  | IncomingCommandControllerStopInclusion
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
  | IncomingCommandControllerSetRFRegion
  | IncomingCommandControllerGetRFRegion
  | IncomingCommandControllerSetPowerlevel
  | IncomingCommandControllerGetPowerlevel
  | IncomingCommandControllerGetState
  | IncomingCommandControllerGetKnownLifelineRoutes
  | IncomingCommandControllerIsAnyOTAFirmwareUpdateInProgress
  | IncomingCommandControllerGetAvailableFirmwareUpdates
  | IncomingCommandControllerBeginOTAFirmwareUpdate
  | IncomingCommandControllerFirmwareUpdateOTA
  | IncomingCommandControllerFirmwareUpdateOTW
  | IncomingCommandIsFirmwareUpdateInProgress;

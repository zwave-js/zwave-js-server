import {
  AssociationAddress,
  InclusionGrant,
  InclusionOptions,
  PlannedProvisioningEntry,
  ReplaceNodeOptions,
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

export interface IncomingCommandControllerBeginExclusion
  extends IncomingCommandControllerBase {
  command: ControllerCommand.beginExclusion;
  unprovision?: boolean;
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

export interface IncomingCommandControllerHealNode
  extends IncomingCommandControllerBase {
  command: ControllerCommand.healNode;
  nodeId: number;
}

export interface IncomingCommandControllerBeginHealingNetwork
  extends IncomingCommandControllerBase {
  command: ControllerCommand.beginHealingNetwork;
}

export interface IncomingCommandControllerStopHealingNetwork
  extends IncomingCommandControllerBase {
  command: ControllerCommand.stopHealingNetwork;
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
  dsk: string;
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

export type IncomingMessageController =
  | IncomingCommandControllerBeginInclusion
  | IncomingCommandControllerBeginInclusionLegacy
  | IncomingCommandControllerStopInclusion
  | IncomingCommandControllerBeginExclusion
  | IncomingCommandControllerStopExclusion
  | IncomingCommandControllerRemoveFailedNode
  | IncomingCommandControllerReplaceFailedNode
  | IncomingCommandControllerReplaceFailedNodeLegacy
  | IncomingCommandControllerHealNode
  | IncomingCommandControllerBeginHealingNetwork
  | IncomingCommandControllerStopHealingNetwork
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
  | IncomingCommandControllerSupportsFeature;

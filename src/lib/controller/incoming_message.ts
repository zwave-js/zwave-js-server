import { Association } from "zwave-js";
import { IncomingCommandBase } from "../incoming_message_base";
import { ControllerCommand } from "./command";

export interface IncomingCommandControllerBase extends IncomingCommandBase {}

export interface IncomingCommandControllerBeginInclusion
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

export interface IncomingCommandControllerReplaceFailedNode
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
}

export interface IncomingCommandControllerGetAssociations
  extends IncomingCommandControllerBase {
  command: ControllerCommand.getAssociations;
  nodeId: number;
}

export interface IncomingCommandControllerIsAssociationAllowed
  extends IncomingCommandControllerBase {
  command: ControllerCommand.isAssociationAllowed;
  nodeId: number;
  group: number;
  association: Association;
}

export interface IncomingCommandControllerAddAssociations
  extends IncomingCommandControllerBase {
  command: ControllerCommand.addAssociations;
  nodeId: number;
  group: number;
  associations: Association[];
}

export interface IncomingCommandControllerRemoveAssociations
  extends IncomingCommandControllerBase {
  command: ControllerCommand.removeAssociations;
  nodeId: number;
  group: number;
  associations: Association[];
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

export type IncomingMessageController =
  | IncomingCommandControllerBeginInclusion
  | IncomingCommandControllerStopInclusion
  | IncomingCommandControllerBeginExclusion
  | IncomingCommandControllerStopExclusion
  | IncomingCommandControllerRemoveFailedNode
  | IncomingCommandControllerReplaceFailedNode
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
  | IncomingCommandControllerGetNodeNeighbors;

import { Association, AssociationGroup } from "zwave-js";
import { ControllerCommand } from "./command";

export interface ControllerResultTypes {
  [ControllerCommand.beginInclusion]: { success: boolean };
  [ControllerCommand.stopInclusion]: { success: boolean };
  [ControllerCommand.beginExclusion]: { success: boolean };
  [ControllerCommand.stopExclusion]: { success: boolean };
  [ControllerCommand.removeFailedNode]: Record<string, never>;
  [ControllerCommand.replaceFailedNode]: { success: boolean };
  [ControllerCommand.healNode]: { success: boolean };
  [ControllerCommand.beginHealingNetwork]: { success: boolean };
  [ControllerCommand.stopHealingNetwork]: { success: boolean };
  [ControllerCommand.isFailedNode]: { failed: boolean };
  [ControllerCommand.getAssociationGroups]: {
    groups: Record<number, AssociationGroup>;
  };
  [ControllerCommand.getAssociations]: {
    associations: Record<number, readonly Association[]>;
  };
  [ControllerCommand.isAssociationAllowed]: { allowed: boolean };
  [ControllerCommand.addAssociations]: Record<string, never>;
  [ControllerCommand.removeAssociations]: Record<string, never>;
  // Schema version < 3
  [ControllerCommand.removeNodeFromAllAssocations]: Record<string, never>;
  // Schema version > 2
  [ControllerCommand.removeNodeFromAllAssociations]: Record<string, never>;
  [ControllerCommand.getNodeNeighbors]: { neighbors: readonly number[] };
}

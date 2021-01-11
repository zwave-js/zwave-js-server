import { Association, AssociationGroup } from "zwave-js";
import { ControllerCommand } from "./command";

export interface ControllerResultTypes {
  [ControllerCommand.beginInclusion]: { success: boolean };
  [ControllerCommand.stopInclusion]: { success: boolean };
  [ControllerCommand.beginExclusion]: { success: boolean };
  [ControllerCommand.stopExclusion]: { success: boolean };
  [ControllerCommand.removeFailedNode]: {};
  [ControllerCommand.replaceFailedNode]: { success: boolean };
  [ControllerCommand.healNode]: { success: boolean };
  [ControllerCommand.beginHealingNetwork]: { success: boolean };
  [ControllerCommand.stopHealingNetwork]: { success: boolean };
  [ControllerCommand.isFailedNode]: { success: boolean };
  [ControllerCommand.getAssociationGroups]: {
    groups: Record<number, AssociationGroup>;
  };
  [ControllerCommand.getAssociations]: {
    associations: Record<number, readonly Association[]>;
  };
  [ControllerCommand.isAssociationAllowed]: { success: boolean };
  [ControllerCommand.addAssociations]: {};
  [ControllerCommand.removeAssociations]: {};
  [ControllerCommand.removeNodeFromAllAssocations]: {};
}

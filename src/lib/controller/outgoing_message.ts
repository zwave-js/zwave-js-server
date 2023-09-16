import {
  AssociationAddress,
  AssociationGroup,
  FirmwareUpdateInfo,
  LifelineRoutes,
  RFRegion,
  SmartStartProvisioningEntry,
} from "zwave-js";
import { ControllerState } from "..";
import { ControllerCommand } from "./command";
import { FirmwareUpdateResultType } from "../common";

export interface ControllerResultTypes {
  [ControllerCommand.beginInclusion]: { success: boolean };
  [ControllerCommand.stopInclusion]: { success: boolean };
  [ControllerCommand.beginExclusion]: { success: boolean };
  [ControllerCommand.stopExclusion]: { success: boolean };
  [ControllerCommand.removeFailedNode]: Record<string, never>;
  [ControllerCommand.replaceFailedNode]: { success: boolean };
  [ControllerCommand.healNode]: { success: boolean };
  [ControllerCommand.rebuildNodeRoutes]: { success: boolean };
  [ControllerCommand.beginHealingNetwork]: { success: boolean };
  [ControllerCommand.beginRebuildingRoutes]: { success: boolean };
  [ControllerCommand.stopHealingNetwork]: { success: boolean };
  [ControllerCommand.stopRebuildingRoutes]: { success: boolean };
  [ControllerCommand.isFailedNode]: { failed: boolean };
  [ControllerCommand.getAssociationGroups]: {
    groups: Record<number, AssociationGroup>;
  };
  [ControllerCommand.getAssociations]: {
    associations: Record<number, readonly AssociationAddress[]>;
  };
  [ControllerCommand.isAssociationAllowed]: { allowed: boolean };
  [ControllerCommand.addAssociations]: Record<string, never>;
  [ControllerCommand.removeAssociations]: Record<string, never>;
  // Schema version < 3
  [ControllerCommand.removeNodeFromAllAssocations]: Record<string, never>;
  // Schema version > 2
  [ControllerCommand.removeNodeFromAllAssociations]: Record<string, never>;
  [ControllerCommand.getNodeNeighbors]: { neighbors: readonly number[] };
  [ControllerCommand.grantSecurityClasses]: Record<string, never>;
  [ControllerCommand.validateDSKAndEnterPIN]: Record<string, never>;
  [ControllerCommand.provisionSmartStartNode]: Record<string, never>;
  [ControllerCommand.unprovisionSmartStartNode]: Record<string, never>;
  [ControllerCommand.getProvisioningEntry]: {
    entry: SmartStartProvisioningEntry | undefined;
  };
  [ControllerCommand.getProvisioningEntries]: {
    entries: SmartStartProvisioningEntry[];
  };
  [ControllerCommand.supportsFeature]: { supported: boolean | undefined };
  [ControllerCommand.backupNVMRaw]: { nvmData: string };
  [ControllerCommand.restoreNVM]: Record<string, never>;
  [ControllerCommand.setRFRegion]: { success: boolean };
  [ControllerCommand.getRFRegion]: { region: RFRegion };
  [ControllerCommand.setPowerlevel]: { success: boolean };
  [ControllerCommand.getPowerlevel]: {
    powerlevel: number;
    measured0dBm: number;
  };
  [ControllerCommand.getState]: { state: ControllerState };
  [ControllerCommand.getKnownLifelineRoutes]: {
    routes: ReadonlyMap<number, LifelineRoutes>;
  };
  [ControllerCommand.getAnyFirmwareUpdateProgress]: {
    progress: boolean;
  };
  [ControllerCommand.isAnyOTAFirmwareUpdateInProgress]: {
    progress: boolean;
  };
  [ControllerCommand.getAvailableFirmwareUpdates]: {
    updates: FirmwareUpdateInfo[];
  };
  [ControllerCommand.beginOTAFirmwareUpdate]: Record<string, never>;
  [ControllerCommand.firmwareUpdateOTA]: FirmwareUpdateResultType;
  [ControllerCommand.firmwareUpdateOTW]: FirmwareUpdateResultType;
  [ControllerCommand.isFirmwareUpdateInProgress]: { progress: boolean };
}

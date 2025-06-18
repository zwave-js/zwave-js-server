import {
  AssociationAddress,
  AssociationCheckResult,
  AssociationGroup,
  FirmwareUpdateInfo,
  LifelineRoutes,
  RFRegion,
  SmartStartProvisioningEntry,
} from "zwave-js";
import { LongRangeChannel } from "@zwave-js/core";
import { ControllerCommand } from "./command.js";
import { FirmwareUpdateResultType } from "../common.js";
import { ControllerState } from "../state.js";

export interface ControllerResultTypes {
  [ControllerCommand.beginInclusion]: { success: boolean };
  [ControllerCommand.stopInclusion]: { success: boolean };
  [ControllerCommand.cancelSecureBootstrapS2]: Record<string, never>;
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
  [ControllerCommand.checkAssociation]: { result: AssociationCheckResult };
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
  [ControllerCommand.toggleRF]: { success: boolean };
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
  [ControllerCommand.setMaxLongRangePowerlevel]: { success: boolean };
  [ControllerCommand.getMaxLongRangePowerlevel]: { limit: number };
  [ControllerCommand.setLongRangeChannel]: { success: boolean };
  [ControllerCommand.getLongRangeChannel]: {
    channel: LongRangeChannel;
    supportsAutoChannelSelection: boolean;
  };
}

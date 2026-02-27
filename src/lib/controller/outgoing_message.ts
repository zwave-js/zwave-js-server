import {
  AssociationAddress,
  AssociationCheckResult,
  AssociationGroup,
  FirmwareUpdateInfo,
  JoinNetworkResult,
  LeaveNetworkResult,
  LifelineRoutes,
  RFRegion,
  SmartStartProvisioningEntry,
} from "zwave-js";
import {
  LongRangeChannel,
  MaybeUnknown,
  Route,
  RouteKind,
  ZWaveDataRate,
  RSSI,
} from "@zwave-js/core";
import {
  ExtendedNVMOperationsCommand,
  NVMId,
} from "@zwave-js/serial/serialapi";
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
  [ControllerCommand.getAllAvailableFirmwareUpdates]: {
    updates: Map<number, FirmwareUpdateInfo[]>;
  };
  // Routing operations
  [ControllerCommand.assignReturnRoutes]: { success: boolean };
  [ControllerCommand.deleteReturnRoutes]: { success: boolean };
  [ControllerCommand.assignSUCReturnRoutes]: { success: boolean };
  [ControllerCommand.deleteSUCReturnRoutes]: { success: boolean };
  [ControllerCommand.assignPriorityReturnRoute]: { success: boolean };
  [ControllerCommand.assignPrioritySUCReturnRoute]: { success: boolean };
  [ControllerCommand.assignCustomReturnRoutes]: { success: boolean };
  [ControllerCommand.assignCustomSUCReturnRoutes]: { success: boolean };
  [ControllerCommand.setPriorityRoute]: { success: boolean };
  [ControllerCommand.removePriorityRoute]: { success: boolean };
  [ControllerCommand.getPriorityRoute]: {
    route:
      | {
          routeKind: RouteKind.LWR | RouteKind.NLWR | RouteKind.Application;
          repeaters: number[];
          routeSpeed: ZWaveDataRate;
        }
      | undefined;
  };
  [ControllerCommand.discoverNodeNeighbors]: { success: boolean };
  // Diagnostics
  [ControllerCommand.getBackgroundRSSI]: {
    rssiChannel0: RSSI;
    rssiChannel1: RSSI;
    rssiChannel2?: RSSI;
    rssiChannel3?: RSSI;
  };
  // Long Range
  [ControllerCommand.getLongRangeNodes]: { nodeIds: readonly number[] };
  // Controller identification
  [ControllerCommand.getDSK]: { dsk: string }; // base64 encoded
  // NVM operations
  [ControllerCommand.getNVMId]: { nvmId: NVMId };
  [ControllerCommand.externalNVMOpen]: { size: number };
  [ControllerCommand.externalNVMClose]: Record<string, never>;
  [ControllerCommand.externalNVMReadByte]: { byte: number };
  [ControllerCommand.externalNVMWriteByte]: { success: boolean };
  [ControllerCommand.externalNVMReadBuffer]: { buffer: string }; // base64 encoded
  [ControllerCommand.externalNVMWriteBuffer]: { success: boolean };
  [ControllerCommand.externalNVMReadBuffer700]: {
    buffer: string; // base64 encoded
    endOfFile: boolean;
  };
  [ControllerCommand.externalNVMWriteBuffer700]: { endOfFile: boolean };
  [ControllerCommand.externalNVMOpenExt]: {
    size: number;
    supportedOperations: ExtendedNVMOperationsCommand[];
  };
  [ControllerCommand.externalNVMCloseExt]: Record<string, never>;
  [ControllerCommand.externalNVMReadBufferExt]: {
    buffer: string; // base64 encoded
    endOfFile: boolean;
  };
  [ControllerCommand.externalNVMWriteBufferExt]: { endOfFile: boolean };
  // Watchdog operations
  [ControllerCommand.startWatchdog]: { success: boolean };
  [ControllerCommand.stopWatchdog]: { success: boolean };
  // RF region extended
  [ControllerCommand.querySupportedRFRegions]: { regions: RFRegion[] };
  [ControllerCommand.queryRFRegionInfo]: {
    region: RFRegion;
    supportsZWave: boolean;
    supportsLongRange: boolean;
    includesRegion?: RFRegion;
  };
  // Network join/leave
  [ControllerCommand.beginJoiningNetwork]: { result: JoinNetworkResult };
  [ControllerCommand.stopJoiningNetwork]: { success: boolean };
  [ControllerCommand.beginLeavingNetwork]: { result: LeaveNetworkResult };
  [ControllerCommand.stopLeavingNetwork]: { success: boolean };
  // Cached route queries
  [ControllerCommand.getPriorityReturnRouteCached]: {
    route: MaybeUnknown<Route> | undefined;
  };
  [ControllerCommand.getPriorityReturnRoutesCached]: {
    routes: Record<number, Route>;
  };
  [ControllerCommand.getPrioritySUCReturnRouteCached]: {
    route: MaybeUnknown<Route> | undefined;
  };
  [ControllerCommand.getCustomReturnRoutesCached]: { routes: Route[] };
  [ControllerCommand.getCustomSUCReturnRoutesCached]: { routes: Route[] };
  // Association queries (all endpoints)
  [ControllerCommand.getAllAssociationGroups]: {
    groups: ReadonlyMap<number, ReadonlyMap<number, AssociationGroup>>;
  };
  [ControllerCommand.getAllAssociations]: {
    associations: ReadonlyMap<
      number,
      ReadonlyMap<number, ReadonlyMap<number, readonly AssociationAddress[]>>
    >;
  };
  // RF region info
  [ControllerCommand.getSupportedRFRegions]: {
    regions: RFRegion[] | undefined;
  };
}

import {
  FirmwareUpdateCapabilities,
  LifelineHealthCheckSummary,
  RouteHealthCheckSummary,
  TranslatedValueID,
  ValueMetadata,
} from "zwave-js";
import { SecurityClass } from "@zwave-js/core";
import { NodeCommand } from "./command";
import { NodeState } from "../state";

export interface NodeResultTypes {
  [NodeCommand.setValue]: { success: boolean };
  [NodeCommand.refreshInfo]: Record<string, never>;
  [NodeCommand.getDefinedValueIDs]: { valueIds: TranslatedValueID[] };
  [NodeCommand.getValueMetadata]: ValueMetadata;
  [NodeCommand.beginFirmwareUpdate]: Record<string, never>;
  [NodeCommand.abortFirmwareUpdate]: Record<string, never>;
  [NodeCommand.getFirmwareUpdateCapabilities]: {
    capabilities: FirmwareUpdateCapabilities;
  };
  [NodeCommand.getFirmwareUpdateCapabilitiesCached]: {
    capabilities: FirmwareUpdateCapabilities;
  };
  [NodeCommand.pollValue]: { value: any | undefined };
  [NodeCommand.setRawConfigParameterValue]: Record<string, never>;
  [NodeCommand.refreshValues]: Record<string, never>;
  [NodeCommand.refreshCCValues]: Record<string, never>;
  [NodeCommand.ping]: { responded: boolean };
  [NodeCommand.hasSecurityClass]: { hasSecurityClass: boolean | "unknown" };
  [NodeCommand.getHighestSecurityClass]: {
    highestSecurityClass: SecurityClass | undefined;
  };
  [NodeCommand.testPowerlevel]: { framesAcked: number };
  [NodeCommand.checkLifelineHealth]: { summary: LifelineHealthCheckSummary };
  [NodeCommand.checkRouteHealth]: { summary: RouteHealthCheckSummary };
  [NodeCommand.getValue]: { value?: any };
  [NodeCommand.getEndpointCount]: { count: number };
  [NodeCommand.interviewCC]: Record<string, never>;
  [NodeCommand.getState]: { state: NodeState };
  [NodeCommand.setName]: Record<string, never>;
  [NodeCommand.setLocation]: Record<string, never>;
  [NodeCommand.setKeepAwake]: Record<string, never>;
  [NodeCommand.getFirmwareUpdateProgress]: { progress: boolean };
  [NodeCommand.isFirmwareUpdateInProgress]: { progress: boolean };
  [NodeCommand.waitForWakeup]: Record<string, never>;
}

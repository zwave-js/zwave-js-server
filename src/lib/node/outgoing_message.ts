import { TranslatedValueID, ValueMetadata } from "zwave-js";
import { NodeCommand } from "./command";

export interface NodeResultTypes {
  [NodeCommand.setValue]: { success: boolean };
  [NodeCommand.refreshInfo]: Record<string, never>;
  [NodeCommand.getDefinedValueIDs]: { valueIds: TranslatedValueID[] };
  [NodeCommand.getValueMetadata]: ValueMetadata;
  [NodeCommand.beginFirmwareUpdate]: Record<string, never>;
  [NodeCommand.abortFirmwareUpdate]: Record<string, never>;
  [NodeCommand.pollValue]: { value: any | undefined };
  [NodeCommand.setRawConfigParameterValue]: Record<string, never>;
  [NodeCommand.refreshValues]: Record<string, never>;
  [NodeCommand.refreshCCValues]: Record<string, never>;
  [NodeCommand.ping]: { responded: boolean };
}

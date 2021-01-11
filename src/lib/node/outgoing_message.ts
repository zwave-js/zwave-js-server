import { TranslatedValueID, ValueMetadata } from "zwave-js";
import { NodeCommand } from "./command";

export interface NodeResultTypes {
  [NodeCommand.setValue]: { success: boolean };
  [NodeCommand.refreshInfo]: {};
  [NodeCommand.getDefinedValueIDs]: { valueIds: TranslatedValueID[] };
  [NodeCommand.getValueMetadata]: ValueMetadata;
  [NodeCommand.abortFirmwareUpdate]: {};
}

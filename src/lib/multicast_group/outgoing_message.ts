import { SetValueResult, VirtualValueID } from "zwave-js";
import { MulticastGroupCommand } from "./command";

export interface MulticastGroupResultTypes {
  [MulticastGroupCommand.setValue]:
    | { result: SetValueResult } // schemaVersion >= 29
    | { success: boolean }; // schemaVersion < 29
  [MulticastGroupCommand.getEndpointCount]: { count: number };
  [MulticastGroupCommand.supportsCC]: { supported: boolean };
  [MulticastGroupCommand.getCCVersion]: { version: number };
  [MulticastGroupCommand.invokeCCAPI]: { response: unknown };
  [MulticastGroupCommand.supportsCCAPI]: { supported: boolean };
  [MulticastGroupCommand.getDefinedValueIDs]: { valueIDs: VirtualValueID[] };
}

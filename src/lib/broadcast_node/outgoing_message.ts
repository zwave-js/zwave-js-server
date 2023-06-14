import { VirtualValueID, SetValueResult } from "zwave-js";
import { BroadcastNodeCommand } from "./command";

export interface BroadcastNodeResultTypes {
  [BroadcastNodeCommand.setValue]: { result: SetValueResult };
  [BroadcastNodeCommand.getEndpointCount]: { count: number };
  [BroadcastNodeCommand.supportsCC]: { supported: boolean };
  [BroadcastNodeCommand.getCCVersion]: { version: number };
  [BroadcastNodeCommand.invokeCCAPI]: { response: unknown };
  [BroadcastNodeCommand.supportsCCAPI]: { supported: boolean };
  [BroadcastNodeCommand.getDefinedValueIDs]: { valueIDs: VirtualValueID[] };
}

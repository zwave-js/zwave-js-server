import { VirtualValueID } from "zwave-js";
import { BroadcastNodeCommand } from "./command";
import { SetValueResultType } from "../common";

export interface BroadcastNodeResultTypes {
  [BroadcastNodeCommand.setValue]: SetValueResultType;
  [BroadcastNodeCommand.getEndpointCount]: { count: number };
  [BroadcastNodeCommand.supportsCC]: { supported: boolean };
  [BroadcastNodeCommand.getCCVersion]: { version: number };
  [BroadcastNodeCommand.invokeCCAPI]: { response: unknown };
  [BroadcastNodeCommand.supportsCCAPI]: { supported: boolean };
  [BroadcastNodeCommand.getDefinedValueIDs]: { valueIDs: VirtualValueID[] };
}

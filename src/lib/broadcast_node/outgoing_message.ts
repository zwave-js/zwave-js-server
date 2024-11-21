import { VirtualValueID } from "zwave-js";
import { BroadcastNodeCommand } from "./command.js";
import { SetValueResultType } from "../common.js";

export interface BroadcastNodeResultTypes {
  [BroadcastNodeCommand.setValue]: SetValueResultType;
  [BroadcastNodeCommand.getEndpointCount]: { count: number };
  [BroadcastNodeCommand.supportsCC]: { supported: boolean };
  [BroadcastNodeCommand.getCCVersion]: { version: number };
  [BroadcastNodeCommand.invokeCCAPI]: { response: unknown };
  [BroadcastNodeCommand.supportsCCAPI]: { supported: boolean };
  [BroadcastNodeCommand.getDefinedValueIDs]: { valueIDs: VirtualValueID[] };
}

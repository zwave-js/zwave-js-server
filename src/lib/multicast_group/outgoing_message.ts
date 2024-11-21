import { VirtualValueID } from "zwave-js";
import { MulticastGroupCommand } from "./command.js";
import { SetValueResultType } from "../common.js";

export interface MulticastGroupResultTypes {
  [MulticastGroupCommand.setValue]: SetValueResultType;
  [MulticastGroupCommand.getEndpointCount]: { count: number };
  [MulticastGroupCommand.supportsCC]: { supported: boolean };
  [MulticastGroupCommand.getCCVersion]: { version: number };
  [MulticastGroupCommand.invokeCCAPI]: { response: unknown };
  [MulticastGroupCommand.supportsCCAPI]: { supported: boolean };
  [MulticastGroupCommand.getDefinedValueIDs]: { valueIDs: VirtualValueID[] };
}

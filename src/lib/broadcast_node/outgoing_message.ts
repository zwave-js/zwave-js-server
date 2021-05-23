import { BroadcastNodeCommand } from "./command";

export interface BroadcastNodeResultTypes {
  [BroadcastNodeCommand.setValue]: { success: boolean };
  [BroadcastNodeCommand.getEndpointCount]: { count: number };
  [BroadcastNodeCommand.supportsCC]: { supported: boolean };
  [BroadcastNodeCommand.getCCVersion]: { version: number };
}

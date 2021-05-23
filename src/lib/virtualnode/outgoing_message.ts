import { VirtualNodeCommand } from "./command";

export interface VirtualNodeResultTypes {
  [VirtualNodeCommand.setValueBroadcast]: { success: boolean };
  [VirtualNodeCommand.setValueMulticast]: { success: boolean };
  [VirtualNodeCommand.getEndpointCountBroadcast]: { count: number };
  [VirtualNodeCommand.getEndpointCountMulticast]: { count: number };
}

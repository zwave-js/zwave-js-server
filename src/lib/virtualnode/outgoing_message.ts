import { VirtualNodeCommand } from "./command";

export interface VirtualNodeResultTypes {
  [VirtualNodeCommand.setValue]: { success: boolean };
  [VirtualNodeCommand.getEndpointCount]: { count: number };
}

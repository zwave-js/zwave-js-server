import { NodeCommand } from "./command";

export interface NodeResultTypes {
  [NodeCommand.setValue]: { success: boolean };
}

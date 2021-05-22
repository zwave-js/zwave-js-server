import { VirtualEndpointCommand } from "./command";

export interface VirtualEndpointResultTypes {
  [VirtualEndpointCommand.supportsCC]: { supported: boolean };
  [VirtualEndpointCommand.getCCVersion]: { version: number };
}

import { VirtualEndpointCommand } from "./command";

export interface VirtualEndpointResultTypes {
  [VirtualEndpointCommand.supportsCCBroadcast]: { supported: boolean };
  [VirtualEndpointCommand.supportsCCMulticast]: { supported: boolean };
  [VirtualEndpointCommand.getCCVersionBroadcast]: { version: number };
  [VirtualEndpointCommand.getCCVersionMulticast]: { version: number };
}

import { EndpointCommand } from "./command";

export interface EndpointResultTypes {
  [EndpointCommand.invokeCCAPI]: { response: unknown };
  [EndpointCommand.supportsCCAPI]: { supported: boolean };
}

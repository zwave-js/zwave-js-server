import { EndpointCommand } from "./command";

export interface EndpointResultTypes {
  [EndpointCommand.supportsCCAPI]: { supported: boolean };
  [EndpointCommand.invokeCCAPI]: { response: unknown };
}

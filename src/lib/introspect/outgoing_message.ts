import { IntrospectCommand } from "./command.js";

export interface IntrospectResultTypes {
  [IntrospectCommand.commands]: Record<string, unknown>;
  [IntrospectCommand.states]: Record<string, unknown>;
}

import { IncomingCommandBase } from "../incoming_message_base.js";
import { IntrospectCommand } from "./command.js";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IncomingCommandIntrospectBase extends IncomingCommandBase {}

export interface IncomingCommandIntrospectCommands extends IncomingCommandIntrospectBase {
  command: IntrospectCommand.commands;
  commandType?: string;
}

export type IncomingMessageIntrospect = IncomingCommandIntrospectCommands;

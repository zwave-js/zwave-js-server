import { UnknownCommandError } from "../error.js";
import incomingMessageSchema from "../generated/incoming_message_schema.js";
import { MessageHandler } from "../message_handler.js";
import { IntrospectCommand } from "./command.js";
import { IncomingMessageIntrospect } from "./incoming_message.js";
import { IntrospectResultTypes } from "./outgoing_message.js";

export class IntrospectMessageHandler implements MessageHandler {
  async handle(
    message: IncomingMessageIntrospect,
  ): Promise<IntrospectResultTypes[IntrospectCommand]> {
    const { command } = message;

    switch (message.command) {
      case IntrospectCommand.commands:
        return incomingMessageSchema;
      default:
        throw new UnknownCommandError(command);
    }
  }
}

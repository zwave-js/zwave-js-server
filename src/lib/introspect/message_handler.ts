import { UnknownCommandError } from "../error.js";
import incomingMessageSchema from "../generated/incoming_message_schema.json" with { type: "json" };
import stateSchema from "../generated/state_schema.json" with { type: "json" };
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
      case IntrospectCommand.states:
        return stateSchema;
      default:
        throw new UnknownCommandError(command);
    }
  }
}

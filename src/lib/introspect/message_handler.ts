import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { UnknownCommandError } from "../error.js";
import { MessageHandler } from "../message_handler.js";
import { IntrospectCommand } from "./command.js";
import { IncomingMessageIntrospect } from "./incoming_message.js";
import { IntrospectResultTypes } from "./outgoing_message.js";

const schemaPath = join(
  dirname(fileURLToPath(import.meta.url)),
  "../generated/incoming_message_schema.json",
);

let cachedSchema: Record<string, unknown> | undefined;

export class IntrospectMessageHandler implements MessageHandler {
  async handle(
    message: IncomingMessageIntrospect,
  ): Promise<IntrospectResultTypes[IntrospectCommand]> {
    const { command } = message;

    switch (message.command) {
      case IntrospectCommand.commands:
        if (!cachedSchema) {
          cachedSchema = JSON.parse(await readFile(schemaPath, "utf-8"));
        }
        return cachedSchema!;
      default:
        throw new UnknownCommandError(command);
    }
  }
}

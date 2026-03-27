import { UnknownCommandError } from "../error.js";
import incomingMessageSchema from "../generated/incoming_message_schema.json" with { type: "json" };
import { MessageHandler } from "../message_handler.js";
import { IntrospectCommand } from "./command.js";
import { IncomingMessageIntrospect } from "./incoming_message.js";
import { IntrospectResultTypes } from "./outgoing_message.js";

function resolveRefs(
  obj: unknown,
  definitions: Record<string, unknown>,
): unknown {
  if (obj === null || typeof obj !== "object") return obj;
  if (Array.isArray(obj))
    return obj.map((item) => resolveRefs(item, definitions));
  const record = obj as Record<string, unknown>;
  if ("$ref" in record && typeof record["$ref"] === "string") {
    const defName = (record["$ref"] as string).replace("#/definitions/", "");
    const resolved = definitions[defName];
    if (resolved !== undefined) {
      return resolveRefs(structuredClone(resolved), definitions);
    }
  }
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(record)) {
    result[key] = resolveRefs(value, definitions);
  }
  return result;
}

function findCommandSchema(name: string): Record<string, unknown> | undefined {
  const schema = incomingMessageSchema as Record<string, unknown>;
  const definitions = schema["definitions"] as Record<string, unknown>;
  const incomingMessage = definitions["IncomingMessage"] as Record<
    string,
    unknown
  >;
  const anyOf = incomingMessage["anyOf"] as Array<Record<string, unknown>>;

  for (const entry of anyOf) {
    if ("$ref" in entry) {
      const refName = (entry["$ref"] as string).replace("#/definitions/", "");
      const resolved = definitions[refName] as Record<string, unknown>;

      if ("anyOf" in resolved) {
        // Sub-union: walk its anyOf entries
        const subAnyOf = resolved["anyOf"] as Array<Record<string, unknown>>;
        for (const subEntry of subAnyOf) {
          if ("$ref" in subEntry) {
            const subRefName = (subEntry["$ref"] as string).replace(
              "#/definitions/",
              "",
            );
            const subResolved = definitions[subRefName] as Record<
              string,
              unknown
            >;
            const props = subResolved["properties"] as
              | Record<string, unknown>
              | undefined;
            const cmdProp = props?.["command"] as
              | Record<string, unknown>
              | undefined;
            if (cmdProp?.["const"] === name) {
              return resolveRefs(
                structuredClone(subResolved),
                definitions,
              ) as Record<string, unknown>;
            }
          }
        }
      } else {
        // Direct ref to a single command definition
        const props = resolved["properties"] as
          | Record<string, unknown>
          | undefined;
        const cmdProp = props?.["command"] as
          | Record<string, unknown>
          | undefined;
        if (cmdProp?.["const"] === name) {
          return resolveRefs(structuredClone(resolved), definitions) as Record<
            string,
            unknown
          >;
        }
      }
    } else {
      // Inline entry
      const props = entry["properties"] as Record<string, unknown> | undefined;
      const cmdProp = props?.["command"] as Record<string, unknown> | undefined;
      if (cmdProp?.["const"] === name) {
        return resolveRefs(structuredClone(entry), definitions) as Record<
          string,
          unknown
        >;
      }
    }
  }

  return undefined;
}

export class IntrospectMessageHandler implements MessageHandler {
  async handle(
    message: IncomingMessageIntrospect,
  ): Promise<IntrospectResultTypes[IntrospectCommand]> {
    const { command } = message;

    switch (message.command) {
      case IntrospectCommand.commands:
        return incomingMessageSchema;
      case IntrospectCommand.describe: {
        const schema = findCommandSchema(message.name);
        if (schema === undefined) {
          throw new UnknownCommandError(message.name);
        }
        return schema;
      }
      default:
        throw new UnknownCommandError(command);
    }
  }
}

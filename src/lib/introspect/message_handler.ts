import {
  BroadcastNodeCommand,
  ConfigManagerCommand,
  ControllerCommand,
  DriverCommand,
  EndpointCommand,
  IntrospectCommand,
  MulticastGroupCommand,
  NodeCommand,
  ServerCommand,
  UtilsCommand,
  ZnifferCommand,
} from "../command.js";
import { UnknownCommandError } from "../error.js";
import incomingMessageSchema from "../generated/incoming_message_schema.json" with { type: "json" };
import { MessageHandler } from "../message_handler.js";
import { IncomingMessageIntrospect } from "./incoming_message.js";
import { IntrospectResultTypes } from "./outgoing_message.js";

const commandsByType: Record<string, readonly string[]> = {
  server: Object.values(ServerCommand),
  node: Object.values(NodeCommand),
  controller: Object.values(ControllerCommand),
  driver: Object.values(DriverCommand),
  endpoint: Object.values(EndpointCommand),
  broadcast_node: Object.values(BroadcastNodeCommand),
  multicast_group: Object.values(MulticastGroupCommand),
  utils: Object.values(UtilsCommand),
  config_manager: Object.values(ConfigManagerCommand),
  zniffer: Object.values(ZnifferCommand),
  introspect: Object.values(IntrospectCommand),
};

interface SchemaEntry {
  $ref?: string;
  properties?: {
    command?: {
      const?: string;
    };
  };
}

interface SchemaDefinition {
  anyOf?: SchemaEntry[];
  $ref?: string;
  properties?: {
    command?: {
      const?: string;
    };
  };
}

function getCommandFromEntry(
  entry: SchemaEntry,
  definitions: Record<string, SchemaDefinition>,
): string | undefined {
  if (entry.properties?.command?.const) {
    return entry.properties.command.const;
  }
  if (entry.$ref) {
    const defName = entry.$ref.split("/").pop()!;
    const def = definitions[defName];
    if (def?.properties?.command?.const) {
      return def.properties.command.const;
    }
  }
  return undefined;
}

function hasMatchingCommand(
  entry: SchemaEntry,
  commands: readonly string[],
  definitions: Record<string, SchemaDefinition>,
): boolean {
  // Inline entry with a command const
  const cmd = getCommandFromEntry(entry, definitions);
  if (cmd) {
    return commands.includes(cmd);
  }

  // $ref entry pointing to a sub-union
  if (entry.$ref) {
    const defName = entry.$ref.split("/").pop()!;
    const def = definitions[defName];
    if (def?.anyOf) {
      return def.anyOf.some((subEntry: SchemaEntry) => {
        const subCmd = getCommandFromEntry(subEntry, definitions);
        return subCmd != null && commands.includes(subCmd);
      });
    }
  }

  return false;
}

function filterSchemaByCommandType(
  schema: Record<string, unknown>,
  commandType: string,
): Record<string, unknown> {
  const commands = commandsByType[commandType];
  if (!commands) {
    return {
      ...schema,
      definitions: {
        ...((schema.definitions as Record<string, unknown>) ?? {}),
        IncomingMessage: { anyOf: [] },
      },
    };
  }

  const definitions = (schema.definitions ?? {}) as Record<
    string,
    SchemaDefinition
  >;
  const incomingMessage = definitions.IncomingMessage as {
    anyOf?: SchemaEntry[];
  };
  if (!incomingMessage?.anyOf) {
    return schema;
  }

  const filteredAnyOf = incomingMessage.anyOf.filter((entry: SchemaEntry) =>
    hasMatchingCommand(entry, commands, definitions),
  );

  return {
    ...schema,
    definitions: {
      ...definitions,
      IncomingMessage: {
        ...incomingMessage,
        anyOf: filteredAnyOf,
      },
    },
  };
}

export class IntrospectMessageHandler implements MessageHandler {
  async handle(
    message: IncomingMessageIntrospect,
  ): Promise<IntrospectResultTypes[IntrospectCommand]> {
    const { command } = message;

    switch (message.command) {
      case IntrospectCommand.commands: {
        if (message.commandType) {
          return filterSchemaByCommandType(
            incomingMessageSchema,
            message.commandType,
          );
        }
        return incomingMessageSchema;
      }
      default:
        throw new UnknownCommandError(command);
    }
  }
}

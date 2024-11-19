import { LogConfig } from "@zwave-js/core";
import { IncomingMessageController } from "./controller/incoming_message.js";
import { ServerCommand } from "./command.js";
import { IncomingCommandBase } from "./incoming_message_base.js";
import { IncomingMessageNode } from "./node/incoming_message.js";
import { IncomingMessageDriver } from "./driver/incoming_message.js";
import { IncomingMessageBroadcastNode } from "./broadcast_node/incoming_message.js";
import { IncomingMessageMulticastGroup } from "./multicast_group/incoming_message.js";
import { IncomingMessageEndpoint } from "./endpoint/incoming_message.js";
import { IncomingMessageUtils } from "./utils/incoming_message.js";
import { IncomingMessageConfigManager } from "./config_manager/incoming_message.js";
import { LogContexts } from "./logging.js";
import { IncomingMessageZniffer } from "./zniffer/incoming_message.js";

interface IncomingCommandStartListening extends IncomingCommandBase {
  command: ServerCommand.startListening;
}

interface IncomingCommandUpdateLogConfig extends IncomingCommandBase {
  command: ServerCommand.updateLogConfig;
  config: Partial<LogConfig>;
}

interface IncomingCommandGetLogConfig extends IncomingCommandBase {
  command: ServerCommand.getLogConfig;
}

interface IncomingCommandSetApiSchema extends IncomingCommandBase {
  command: ServerCommand.setApiSchema;
  schemaVersion: number;
}

interface IncomingCommandInitialize extends IncomingCommandBase {
  command: ServerCommand.initialize;
  schemaVersion: number;
  additionalUserAgentComponents?: Record<string, string>;
}

interface IncomingCommandStartListeningLogs extends IncomingCommandBase {
  command: ServerCommand.startListeningLogs;
  filter?: Partial<LogContexts>;
}

interface IncomingCommandStopListeningLogs extends IncomingCommandBase {
  command: ServerCommand.stopListeningLogs;
}

export type IncomingMessage =
  | IncomingCommandStartListening
  | IncomingCommandUpdateLogConfig
  | IncomingCommandGetLogConfig
  | IncomingCommandSetApiSchema
  | IncomingMessageNode
  | IncomingMessageController
  | IncomingMessageDriver
  | IncomingMessageMulticastGroup
  | IncomingMessageBroadcastNode
  | IncomingMessageEndpoint
  | IncomingMessageUtils
  | IncomingMessageZniffer
  | IncomingMessageConfigManager
  | IncomingCommandInitialize
  | IncomingCommandStartListeningLogs
  | IncomingCommandStopListeningLogs;

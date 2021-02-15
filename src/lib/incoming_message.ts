import { LogConfig } from "@zwave-js/core";
import { DeepPartial } from "@zwave-js/shared";
import { IncomingMessageController } from "./controller/incoming_message";
import { IncomingCommandBase } from "./incoming_message_base";
import { IncomingMessageNode } from "./node/incoming_message";

interface IncomingCommandStartListening extends IncomingCommandBase {
  messageId: string;
  command: "start_listening";
}

interface IncomingCommandUpdateLogConfig extends IncomingCommandBase {
  messageId: string;
  command: "update_log_config";
  config: DeepPartial<LogConfig>;
}

export type IncomingMessage =
  | IncomingCommandStartListening
  | IncomingCommandUpdateLogConfig
  | IncomingMessageNode
  | IncomingMessageController;

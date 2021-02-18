import { LogConfig } from "@zwave-js/core";
import { IncomingMessageController } from "./controller/incoming_message";
import { DriverCommand } from "./command";
import { IncomingCommandBase } from "./incoming_message_base";
import { IncomingMessageNode } from "./node/incoming_message";

interface IncomingCommandStartListening extends IncomingCommandBase {
  command: DriverCommand.startListening;
}

interface IncomingCommandUpdateLogConfig extends IncomingCommandBase {
  command: DriverCommand.updateLogConfig;
  config: Partial<LogConfig>;
}

export type IncomingMessage =
  | IncomingCommandStartListening
  | IncomingCommandUpdateLogConfig
  | IncomingMessageNode
  | IncomingMessageController;

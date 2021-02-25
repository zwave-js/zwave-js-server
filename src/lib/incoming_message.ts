import { LogConfig } from "@zwave-js/core";
import { IncomingMessageController } from "./controller/incoming_message";
import { DriverCommand } from "./command";
import { IncomingCommandBase } from "./incoming_message_base";
import { IncomingMessageNode } from "./node/incoming_message";

interface IncomingCommandStartListening extends IncomingCommandBase {
  command: DriverCommand.startListening;
  schemaVersion: number | undefined;
}

interface IncomingCommandUpdateLogConfig extends IncomingCommandBase {
  command: DriverCommand.updateLogConfig;
  config: Partial<LogConfig>;
}

interface IncomingCommandGetLogConfig extends IncomingCommandBase {
  command: DriverCommand.getLogConfig;
}

export type IncomingMessage =
  | IncomingCommandStartListening
  | IncomingCommandUpdateLogConfig
  | IncomingCommandGetLogConfig
  | IncomingMessageNode
  | IncomingMessageController;

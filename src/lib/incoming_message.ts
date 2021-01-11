import { IncomingMessageController } from "./controller/incoming_message";
import { IncomingCommandBase } from "./incoming_message_base";
import { IncomingMessageNode } from "./node/incoming_message";

interface IncomingCommandStartListening extends IncomingCommandBase {
  messageId: string;
  command: "start_listening";
}

export type IncomingMessage =
  | IncomingCommandStartListening
  | IncomingMessageNode
  | IncomingMessageController;

import { IncomingMessage } from "./incoming_message";
import { ResultTypes } from "./outgoing_message";

export abstract class MessageHandler {
  abstract handle(
    message: IncomingMessage,
  ): Promise<ResultTypes[keyof ResultTypes]>;
}

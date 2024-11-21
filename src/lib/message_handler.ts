import { IncomingMessage } from "./incoming_message.js";
import { ResultTypes } from "./outgoing_message.js";

export interface MessageHandler {
  handle(message: IncomingMessage): Promise<ResultTypes[keyof ResultTypes]>;
}

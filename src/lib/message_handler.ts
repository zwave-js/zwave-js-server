import { IncomingMessage } from "./incoming_message";
import { ResultTypes } from "./outgoing_message";

export interface MessageHandler {
  handle(message: IncomingMessage): Promise<ResultTypes[keyof ResultTypes]>;
}

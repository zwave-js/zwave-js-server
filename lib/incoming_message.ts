import { ValueID } from "zwave-js";

interface IncomingCommandStartListening {
  messageId: string;
  command: "start_listening";
}

interface IncomingCommandNodeSetValue {
  messageId: string;
  command: "node.set_value";
  nodeId: number;
  valueId: ValueID;
  value: unknown;
}

export type IncomingMessage =
  | IncomingCommandStartListening
  | IncomingCommandNodeSetValue;

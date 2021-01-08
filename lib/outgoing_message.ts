import type { ZwaveState } from "./state";

export interface OutgoingEvent {
  source: "driver" | "controller" | "node";
  event: string;
  [key: string]: unknown;
}

interface OutgoingVersionMessage {
  type: "version";
  driverVersion: string;
  serverVersion: string;
  homeId: number;
}

interface OutgoingEventMessage {
  type: "event";
  event: OutgoingEvent;
}

interface OutgoingResultMessageError {
  type: "result";
  messageId: string;
  success: false;
  errorCode: string;
}

interface ResultTypes {
  start_listening: { state: ZwaveState };
  "node.set_value": { success: boolean };
}

export interface OutgoingResultMessageSuccess {
  type: "result";
  messageId: string;
  success: true;
  result: ResultTypes[keyof ResultTypes];
}

export type OutgoingMessage =
  | OutgoingVersionMessage
  | OutgoingEventMessage
  | OutgoingResultMessageSuccess
  | OutgoingResultMessageError;

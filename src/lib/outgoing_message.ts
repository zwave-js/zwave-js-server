import type { ZwaveState } from "./state";
import { NodeResultTypes } from "./node/outgoing_message";

export interface OutgoingEvent {
  source: "driver" | "controller" | "node";
  event: string;
  [key: string]: unknown;
}

interface OutgoingVersionMessage {
  type: "version";
  driverVersion: string;
  serverVersion: string;
  homeId: number | undefined;
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

type ResultTypes = {
  start_listening: { state: ZwaveState };
} & NodeResultTypes;

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

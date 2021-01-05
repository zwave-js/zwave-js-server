import type { ZwaveState } from "./state";

export interface OutgoingEvent {
  source: "driver" | "controller" | "node";
  event: string;
  [key: string]: unknown;
}

export interface OutgoingEventMessage {
  type: "event";
  data: OutgoingEvent;
}

export interface OutgoingStateMessage {
  type: "state";
  state: ZwaveState;
}

export type OutgoingMessage = OutgoingEventMessage | OutgoingStateMessage;

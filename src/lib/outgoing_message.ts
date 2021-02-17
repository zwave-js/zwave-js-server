import type { ZwaveState } from "./state";
import { NodeResultTypes } from "./node/outgoing_message";
import { ControllerResultTypes } from "./controller/outgoing_message";

export interface OutgoingEvent {
  source: "controller" | "node";
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

export type ResultTypes =
  | {
      start_listening: { state: ZwaveState };
    }
  | {
      update_log_config: Record<string, never>;
    }
  | NodeResultTypes
  | ControllerResultTypes;

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

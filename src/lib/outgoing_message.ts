import { LogConfig } from "@zwave-js/core";
import type { ZwaveState } from "./state";
import { NodeResultTypes } from "./node/outgoing_message";
import { ControllerResultTypes } from "./controller/outgoing_message";
import { DriverCommand } from "./command";

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
  minSchemeVersion: number;
  maxSchemeVersion: number;
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

export interface DriverResultTypes {
  [DriverCommand.startListening]: { state: ZwaveState };
  [DriverCommand.updateLogConfig]: Record<string, never>;
  [DriverCommand.getLogConfig]: { config: Partial<LogConfig> };
}

export type ResultTypes = DriverResultTypes &
  NodeResultTypes &
  ControllerResultTypes;

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

import { LogConfig } from "@zwave-js/core";
import type { ZwaveState } from "./state";
import { NodeResultTypes } from "./node/outgoing_message";
import { ControllerResultTypes } from "./controller/outgoing_message";
import { ServerCommand } from "./command";
import { DriverResultTypes } from "./driver/outgoing_message";

export interface OutgoingEvent {
  source: "controller" | "node" | "driver";
  event: string;
  [key: string]: unknown;
}

interface OutgoingVersionMessage {
  type: "version";
  driverVersion: string;
  serverVersion: string;
  homeId: number | undefined;
  minSchemaVersion: number;
  maxSchemaVersion: number;
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

export interface ServerResultTypes {
  [ServerCommand.startListening]: { state: ZwaveState };
  [ServerCommand.updateLogConfig]: Record<string, never>;
  [ServerCommand.getLogConfig]: { config: Partial<LogConfig> };
  [ServerCommand.startListeningToLogs]: Record<string, never>;
  [ServerCommand.stopListeningToLogs]: Record<string, never>;
}

export type ResultTypes = ServerResultTypes &
  NodeResultTypes &
  ControllerResultTypes &
  DriverResultTypes;

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

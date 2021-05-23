import { LogConfig, ZWaveErrorCodes } from "@zwave-js/core";
import type { ZwaveState } from "./state";
import { NodeResultTypes } from "./node/outgoing_message";
import { ControllerResultTypes } from "./controller/outgoing_message";
import { ServerCommand } from "./command";
import { DriverResultTypes } from "./driver/outgoing_message";
import { ErrorCode } from "./error";
import { BroadcastNodeResultTypes } from "./broadcast_node/outgoing_message";
import { MulticastGroupResultTypes } from "./multicast_group/outgoing_message";

export interface OutgoingEvent {
  source: "controller" | "node" | "driver" | "virtualnode" | "virtualendpoint";
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
  errorCode: Omit<ErrorCode, "zwaveError">;
}

interface OutgoingResultMessageZWaveError {
  type: "result";
  messageId: string;
  success: false;
  errorCode: ErrorCode.zwaveError;
  zwaveErrorCode: ZWaveErrorCodes;
  zwaveErrorMessage: string;
}

export interface ServerResultTypes {
  [ServerCommand.startListening]: { state: ZwaveState };
  [ServerCommand.updateLogConfig]: Record<string, never>;
  [ServerCommand.getLogConfig]: { config: Partial<LogConfig> };
}

export type ResultTypes = ServerResultTypes &
  NodeResultTypes &
  ControllerResultTypes &
  DriverResultTypes &
  MulticastGroupResultTypes &
  BroadcastNodeResultTypes;

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
  | OutgoingResultMessageError
  | OutgoingResultMessageZWaveError;

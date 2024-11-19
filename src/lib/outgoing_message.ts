import { LogConfig, ZWaveErrorCodes } from "@zwave-js/core";
import type { ZwaveState } from "./state.js";
import { NodeResultTypes } from "./node/outgoing_message.js";
import { ControllerResultTypes } from "./controller/outgoing_message.js";
import { ServerCommand } from "./command.js";
import { DriverResultTypes } from "./driver/outgoing_message.js";
import { ErrorCode } from "./error.js";
import { BroadcastNodeResultTypes } from "./broadcast_node/outgoing_message.js";
import { MulticastGroupResultTypes } from "./multicast_group/outgoing_message.js";
import { EndpointResultTypes } from "./endpoint/outgoing_message.js";
import { UtilsResultTypes } from "./utils/outgoing_message.js";
import { ConfigManagerResultTypes } from "./config_manager/outgoing_message.js";
import { ZnifferResultTypes } from "./zniffer/outgoing_message.js";

// https://github.com/microsoft/TypeScript/issues/1897#issuecomment-822032151
export type JSONValue =
  | string
  | number
  | boolean
  | null
  | JSONValue[]
  | { [key: string]: JSONValue }
  | {};

export interface OutgoingEvent {
  source: "controller" | "node" | "driver" | "zniffer";
  event: string;
  [key: string]: JSONValue;
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
  message?: string;
  args: JSONValue;
}

interface OutgoingResultMessageZWaveError {
  type: "result";
  messageId: string;
  success: false;
  errorCode: ErrorCode.zwaveError;
  zwaveErrorCode: ZWaveErrorCodes;
  zwaveErrorCodeName?: string;
  zwaveErrorMessage: string;
}

export interface ServerResultTypes {
  [ServerCommand.startListening]: { state: ZwaveState };
  [ServerCommand.updateLogConfig]: Record<string, never>;
  [ServerCommand.getLogConfig]: { config: Partial<LogConfig> };
  [ServerCommand.initialize]: Record<string, never>;
  [ServerCommand.setApiSchema]: Record<string, never>;
}

export type ResultTypes = ServerResultTypes &
  NodeResultTypes &
  ControllerResultTypes &
  DriverResultTypes &
  MulticastGroupResultTypes &
  BroadcastNodeResultTypes &
  EndpointResultTypes &
  UtilsResultTypes &
  ZnifferResultTypes &
  ConfigManagerResultTypes;

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

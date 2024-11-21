import { RSSI } from "zwave-js";
import { IncomingCommandBase } from "../incoming_message_base.js";
import { UtilsCommand } from "./command.js";

export interface IncomingCommandUtilsBase extends IncomingCommandBase {}

export interface IncomingCommandUtilsParseQRCodeString
  extends IncomingCommandUtilsBase {
  command: UtilsCommand.parseQRCodeString;
  qr: string;
}

export interface IncomingCommandUtilsTryParseDSKFromQRCodeString
  extends IncomingCommandUtilsBase {
  command: UtilsCommand.tryParseDSKFromQRCodeString;
  qr: string;
}

export interface IncomingCommandUtilsNum2hex extends IncomingCommandUtilsBase {
  command: UtilsCommand.num2hex;
  val?: number | null;
  uppercase: boolean;
}

export interface IncomingCommandUtilsFormatId extends IncomingCommandUtilsBase {
  command: UtilsCommand.formatId;
  id: number | string;
}

export interface IncomingCommandUtilsBuffer2hex
  extends IncomingCommandUtilsBase {
  command: UtilsCommand.buffer2hex;
  buffer: Buffer;
  uppercase: boolean;
}

export interface IncomingCommandUtilsGetEnumMemberName
  extends IncomingCommandUtilsBase {
  command: UtilsCommand.getEnumMemberName;
  enumeration: unknown;
  value: number;
}

export interface IncomingCommandUtilsRssiToString
  extends IncomingCommandUtilsBase {
  command: UtilsCommand.rssiToString;
  rssi: RSSI;
}

export type IncomingMessageUtils =
  | IncomingCommandUtilsParseQRCodeString
  | IncomingCommandUtilsTryParseDSKFromQRCodeString
  | IncomingCommandUtilsNum2hex
  | IncomingCommandUtilsFormatId
  | IncomingCommandUtilsBuffer2hex
  | IncomingCommandUtilsGetEnumMemberName
  | IncomingCommandUtilsRssiToString;

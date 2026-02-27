import { RSSI } from "zwave-js";
import { FirmwareFileFormat } from "@zwave-js/core";
import { IncomingCommandBase } from "../incoming_message_base.js";
import { UtilsCommand } from "./command.js";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
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
  buffer: Buffer<ArrayBuffer>; // Parsed buffers own their data
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

export interface IncomingCommandUtilsGuessFirmwareFileFormat
  extends IncomingCommandUtilsBase {
  command: UtilsCommand.guessFirmwareFileFormat;
  filename: string;
  file: string; // base64 encoded
}

export interface IncomingCommandUtilsTryUnzipFirmwareFile
  extends IncomingCommandUtilsBase {
  command: UtilsCommand.tryUnzipFirmwareFile;
  file: string; // base64 encoded ZIP file
}

export interface IncomingCommandUtilsExtractFirmware
  extends IncomingCommandUtilsBase {
  command: UtilsCommand.extractFirmware;
  file: string; // base64 encoded firmware file
  format: FirmwareFileFormat;
}

export type IncomingMessageUtils =
  | IncomingCommandUtilsParseQRCodeString
  | IncomingCommandUtilsTryParseDSKFromQRCodeString
  | IncomingCommandUtilsNum2hex
  | IncomingCommandUtilsFormatId
  | IncomingCommandUtilsBuffer2hex
  | IncomingCommandUtilsGetEnumMemberName
  | IncomingCommandUtilsRssiToString
  | IncomingCommandUtilsGuessFirmwareFileFormat
  | IncomingCommandUtilsTryUnzipFirmwareFile
  | IncomingCommandUtilsExtractFirmware;

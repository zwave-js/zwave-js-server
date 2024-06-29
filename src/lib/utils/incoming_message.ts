import { IncomingCommandBase } from "../incoming_message_base";
import { UtilsCommand } from "./command";

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

export interface IncomingCommandUtilsLookupDevice
  extends IncomingCommandUtilsBase {
  command: UtilsCommand.lookupDevice;
  manufacturerId: number;
  productType: number;
  productId: number;
}

export type IncomingMessageUtils =
  | IncomingCommandUtilsParseQRCodeString
  | IncomingCommandUtilsTryParseDSKFromQRCodeString
  | IncomingCommandUtilsLookupDevice;

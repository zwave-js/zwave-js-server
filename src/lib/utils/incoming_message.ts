import { IncomingCommandBase } from "../incoming_message_base";
import { UtilsCommand } from "./command";

export interface IncomingCommandUtilsBase extends IncomingCommandBase {}

export interface IncomingCommandUtilsParseQRCodeString
  extends IncomingCommandUtilsBase {
  command: UtilsCommand.parseQRCodeString;
  qr: string;
}

export type IncomingMessageUtils = IncomingCommandUtilsParseQRCodeString;

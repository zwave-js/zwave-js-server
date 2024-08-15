import {
  buffer2hex,
  formatId,
  getEnumMemberName,
  num2hex,
  rssiToString,
} from "zwave-js";
import { parseQRCodeString, tryParseDSKFromQRCodeString } from "@zwave-js/core";
import { UnknownCommandError } from "../error";
import { UtilsCommand } from "./command";
import { IncomingMessageUtils } from "./incoming_message";
import { UtilsResultTypes } from "./outgoing_message";

export class UtilsMessageHandler {
  async handle(
    message: IncomingMessageUtils,
  ): Promise<UtilsResultTypes[UtilsCommand]> {
    const { command } = message;

    switch (message.command) {
      case UtilsCommand.parseQRCodeString: {
        const qrProvisioningInformation = parseQRCodeString(message.qr);
        return { qrProvisioningInformation };
      }
      case UtilsCommand.tryParseDSKFromQRCodeString: {
        const dsk = tryParseDSKFromQRCodeString(message.qr);
        return { dsk };
      }
      case UtilsCommand.num2hex: {
        const hex = num2hex(message.val, message.uppercase);
        return { hex };
      }
      case UtilsCommand.formatId: {
        const id = formatId(message.id);
        return { id };
      }
      case UtilsCommand.buffer2hex: {
        const hex = buffer2hex(message.buffer, message.uppercase);
        return { hex };
      }
      case UtilsCommand.getEnumMemberName: {
        const name = getEnumMemberName(message.enumeration, message.value);
        return { name };
      }
      case UtilsCommand.rssiToString: {
        const rssi = rssiToString(message.rssi);
        return { rssi };
      }
      default: {
        throw new UnknownCommandError(command);
      }
    }
  }
}

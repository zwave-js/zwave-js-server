import { parseQRCodeString, tryParseDSKFromQRCodeString } from "@zwave-js/core";
import { UnknownCommandError } from "../error";
import { UtilsCommand } from "./command";
import { IncomingMessageUtils } from "./incoming_message";
import { UtilsResultTypes } from "./outgoing_message";

export class UtilsMessageHandler {
  static async handle(
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
      default: {
        throw new UnknownCommandError(command);
      }
    }
  }
}

import { parseQRCodeString } from "@zwave-js/core";
import { UnknownCommandError } from "../error";
import { UtilsCommand } from "./command";
import { IncomingMessageUtils } from "./incoming_message";
import { UtilsResultTypes } from "./outgoing_message";

export class UtilsMessageHandler {
  static async handle(
    message: IncomingMessageUtils
  ): Promise<UtilsResultTypes[UtilsCommand]> {
    const { command } = message;

    switch (message.command) {
      case UtilsCommand.parseQRCodeString:
        const qrProvisioningInformation = parseQRCodeString(message.qr);
        return { qrProvisioningInformation };
      default:
        throw new UnknownCommandError(command);
    }
  }
}

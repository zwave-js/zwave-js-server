import { parseQRCodeString, tryParseDSKFromQRCodeString } from "@zwave-js/core";
import { ConfigManager } from "@zwave-js/config";
import { UnknownCommandError } from "../error";
import { UtilsCommand } from "./command";
import { IncomingMessageUtils } from "./incoming_message";
import { UtilsResultTypes } from "./outgoing_message";

let _ConfigManager: ConfigManager | undefined;

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
      case UtilsCommand.lookupDevice: {
        if (!_ConfigManager) {
          _ConfigManager = new ConfigManager();
          await _ConfigManager.loadDeviceIndex();
        }
        const config = await _ConfigManager.lookupDevice(
          message.manufacturerId,
          message.productType,
          message.productId,
        );
        return { config };
      }
      default: {
        throw new UnknownCommandError(command);
      }
    }
  }
}

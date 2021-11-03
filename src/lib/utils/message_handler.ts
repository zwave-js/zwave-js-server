import { Driver } from "zwave-js";
import {
  CommandClasses,
  ConfigurationMetadata,
  extractFirmware,
  Firmware,
  guessFirmwareFileFormat,
  parseQRCodeString,
} from "@zwave-js/core";
import { UtilsNotFoundError, UnknownCommandError } from "../error";
import { Client } from "../server";
import { dumpConfigurationMetadata, dumpMetadata } from "../state";
import { UtilsCommand } from "./command";
import { IncomingMessageUtils } from "./incoming_message";
import { UtilsResultTypes } from "./outgoing_message";

export class UtilsMessageHandler {
  static async handle(
    message: IncomingMessageUtils,
    driver: Driver,
    client: Client
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

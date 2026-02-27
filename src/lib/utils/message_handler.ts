import {
  buffer2hex,
  formatId,
  getEnumMemberName,
  num2hex,
  rssiToString,
} from "zwave-js";
import {
  extractFirmware,
  guessFirmwareFileFormat,
  parseQRCodeString,
  tryParseDSKFromQRCodeString,
  tryUnzipFirmwareFile,
} from "@zwave-js/core";
import { UnknownCommandError } from "../error.js";
import { UtilsCommand } from "./command.js";
import { IncomingMessageUtils } from "./incoming_message.js";
import { UtilsResultTypes } from "./outgoing_message.js";
import { MessageHandler } from "../message_handler.js";

export class UtilsMessageHandler implements MessageHandler {
  async handle(
    message: IncomingMessageUtils,
  ): Promise<UtilsResultTypes[UtilsCommand]> {
    const { command } = message;

    switch (message.command) {
      case UtilsCommand.parseQRCodeString: {
        const qrProvisioningInformation = await parseQRCodeString(message.qr);
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
      case UtilsCommand.guessFirmwareFileFormat: {
        const fileBuffer = Buffer.from(message.file, "base64");
        const format = guessFirmwareFileFormat(message.filename, fileBuffer);
        return { format };
      }
      case UtilsCommand.tryUnzipFirmwareFile: {
        const zipBuffer = Buffer.from(message.file, "base64");
        const result = tryUnzipFirmwareFile(zipBuffer);
        if (!result) {
          return { file: undefined };
        }
        return {
          file: {
            filename: result.filename,
            format: result.format,
            data: Buffer.from(result.rawData).toString("base64"),
          },
        };
      }
      case UtilsCommand.extractFirmware: {
        const fileBuffer = Buffer.from(message.file, "base64");
        const firmware = await extractFirmware(fileBuffer, message.format);
        return {
          firmware: {
            data: Buffer.from(firmware.data).toString("base64"),
            firmwareTarget: firmware.firmwareTarget,
          },
        };
      }
      default: {
        throw new UnknownCommandError(command);
      }
    }
  }
}

import { FirmwareFileFormat, QRProvisioningInformation } from "@zwave-js/core";
import { UtilsCommand } from "./command.js";

export interface UtilsResultTypes {
  [UtilsCommand.parseQRCodeString]: {
    qrProvisioningInformation: QRProvisioningInformation;
  };
  [UtilsCommand.tryParseDSKFromQRCodeString]: {
    dsk?: string;
  };
  [UtilsCommand.num2hex]: { hex: string };
  [UtilsCommand.formatId]: { id: string };
  [UtilsCommand.buffer2hex]: { hex: string };
  [UtilsCommand.getEnumMemberName]: { name: string };
  [UtilsCommand.rssiToString]: { rssi: string };
  [UtilsCommand.guessFirmwareFileFormat]: { format: FirmwareFileFormat };
  [UtilsCommand.tryUnzipFirmwareFile]: {
    // Returns undefined if not a valid ZIP or no compatible firmware found
    file:
      | {
          filename: string;
          format: FirmwareFileFormat;
          data: string; // base64 encoded
        }
      | undefined;
  };
  [UtilsCommand.extractFirmware]: {
    firmware: {
      data: string; // base64 encoded
      firmwareTarget?: number;
    };
  };
}

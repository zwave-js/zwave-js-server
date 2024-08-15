import { QRProvisioningInformation } from "@zwave-js/core";
import { DeviceConfig } from "@zwave-js/config";
import { UtilsCommand } from "./command";

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
}

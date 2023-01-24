import { QRProvisioningInformation } from "@zwave-js/core";
import { UtilsCommand } from "./command";

export interface UtilsResultTypes {
  [UtilsCommand.parseQRCodeString]: {
    qrProvisioningInformation: QRProvisioningInformation;
  };
  [UtilsCommand.tryParseDSKFromQRCodeString]: {
    dsk?: string;
  };
}

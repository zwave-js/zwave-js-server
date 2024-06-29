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
  [UtilsCommand.lookupDevice]: {
    config?: DeviceConfig;
  };
}

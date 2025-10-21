import { IncomingCommandBase } from "../incoming_message_base.js";
import { ConfigManagerCommand } from "./command.js";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IncomingCommandConfigManagerBase extends IncomingCommandBase {}

export interface IncomingCommandConfigManagerLookupDevice
  extends IncomingCommandConfigManagerBase {
  command: ConfigManagerCommand.lookupDevice;
  manufacturerId: number;
  productType: number;
  productId: number;
  firmwareVersion?: string;
}

export interface IncomingCommandConfigManagerLoadManufacturers
  extends IncomingCommandConfigManagerBase {
  command: ConfigManagerCommand.loadManufacturers;
}

export interface IncomingCommandConfigManagerLookupManufacturer
  extends IncomingCommandConfigManagerBase {
  command: ConfigManagerCommand.lookupManufacturer;
  manufacturerId: number;
}
export interface IncomingCommandConfigManagerLoadDeviceIndex
  extends IncomingCommandConfigManagerBase {
  command: ConfigManagerCommand.loadDeviceIndex;
}
export interface IncomingCommandConfigManagerGetIndex
  extends IncomingCommandConfigManagerBase {
  command: ConfigManagerCommand.getIndex;
}
export interface IncomingCommandConfigManagerLoadFulltextDeviceIndex
  extends IncomingCommandConfigManagerBase {
  command: ConfigManagerCommand.loadFulltextDeviceIndex;
}
export interface IncomingCommandConfigManagerGetFulltextIndex
  extends IncomingCommandConfigManagerBase {
  command: ConfigManagerCommand.getFulltextIndex;
}
export interface IncomingCommandConfigManagerLookupDevicePreserveConditions
  extends IncomingCommandConfigManagerBase {
  command: ConfigManagerCommand.lookupDevicePreserveConditions;
  manufacturerId: number;
  productType: number;
  productId: number;
  firmwareVersion?: string;
}
export interface IncomingCommandConfigManagerManufacturers
  extends IncomingCommandConfigManagerBase {
  command: ConfigManagerCommand.manufacturers;
}
export interface IncomingCommandConfigManagerLoadAll
  extends IncomingCommandConfigManagerBase {
  command: ConfigManagerCommand.loadAll;
}
export interface IncomingCommandConfigManagerConfigVersion
  extends IncomingCommandConfigManagerBase {
  command: ConfigManagerCommand.configVersion;
}
export type IncomingMessageConfigManager =
  | IncomingCommandConfigManagerLookupDevice
  | IncomingCommandConfigManagerLoadManufacturers
  | IncomingCommandConfigManagerLookupManufacturer
  | IncomingCommandConfigManagerLoadDeviceIndex
  | IncomingCommandConfigManagerGetIndex
  | IncomingCommandConfigManagerLoadFulltextDeviceIndex
  | IncomingCommandConfigManagerGetFulltextIndex
  | IncomingCommandConfigManagerLookupDevicePreserveConditions
  | IncomingCommandConfigManagerManufacturers
  | IncomingCommandConfigManagerLoadAll
  | IncomingCommandConfigManagerConfigVersion;

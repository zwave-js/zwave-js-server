import {
  ConditionalDeviceConfig,
  DeviceConfig,
  DeviceConfigIndex,
  FulltextDeviceConfigIndex,
  ManufacturersMap,
} from "@zwave-js/config";
import { ConfigManagerCommand } from "./command";

export interface ConfigManagerResultTypes {
  [ConfigManagerCommand.lookupDevice]: {
    config?: DeviceConfig;
  };
  [ConfigManagerCommand.loadManufacturers]: Record<string, never>;
  [ConfigManagerCommand.lookupManufacturer]: { name?: string };
  [ConfigManagerCommand.loadDeviceIndex]: Record<string, never>;
  [ConfigManagerCommand.getIndex]: { index?: DeviceConfigIndex };
  [ConfigManagerCommand.loadFulltextDeviceIndex]: Record<string, never>;
  [ConfigManagerCommand.getFulltextIndex]: {
    index?: FulltextDeviceConfigIndex;
  };
  [ConfigManagerCommand.lookupDevicePreserveConditions]: {
    config?: ConditionalDeviceConfig;
  };
  [ConfigManagerCommand.manufacturers]: { manufacturers: ManufacturersMap };
}

import {
  GenericDeviceClass,
  GenericDeviceClassWithSpecific,
  IndicatorProperty,
  Meter,
  MeterScale,
  NamedScaleGroup,
  NamedScales,
  Notification,
  NotificationValue,
  Scale,
  Sensor,
  SpecificDeviceClass,
} from "@zwave-js/core";
import { RegistriesCommand } from "./command";

type ScaleName = keyof NamedScales;
type ScaleKey = keyof NamedScales[ScaleName] & number;

export interface RegistriesResultTypes {
  // Device class registry
  [RegistriesCommand.getAllDeviceClasses]: {
    deviceClasses: readonly GenericDeviceClassWithSpecific[];
  };
  [RegistriesCommand.getGenericDeviceClass]: {
    deviceClass: GenericDeviceClass;
  };
  [RegistriesCommand.getSpecificDeviceClass]: {
    deviceClass: SpecificDeviceClass;
  };

  // Indicator registry
  [RegistriesCommand.getAllIndicatorProperties]: {
    indicatorProperties: readonly IndicatorProperty[];
  };
  [RegistriesCommand.getIndicatorProperty]: {
    indicatorProperty?: IndicatorProperty;
  };

  // Meter registry
  [RegistriesCommand.getAllMeters]: { meters: readonly Meter[] };
  [RegistriesCommand.getAllMeterScales]: { scales?: readonly MeterScale[] };
  [RegistriesCommand.getMeter]: { meter?: Meter };
  [RegistriesCommand.getMeterName]: { name: string };
  [RegistriesCommand.getMeterScale]: { scale?: MeterScale };

  // Notification registry
  [RegistriesCommand.getAllNotifications]: {
    notifications: readonly Notification[];
  };
  [RegistriesCommand.getNotification]: { notification?: Notification };
  [RegistriesCommand.getNotificationEventName]: { name: string };
  [RegistriesCommand.getNotificationName]: { name: string };
  [RegistriesCommand.getNotificationValue]: { value?: NotificationValue };
  [RegistriesCommand.getNotificationValueName]: { name: string };

  // Scale registry
  [RegistriesCommand.getAllNamedScaleGroups]: {
    groups: readonly NamedScaleGroup[];
  };
  [RegistriesCommand.getNamedScale]: {
    scale: {
      key: ScaleKey;
    } & NamedScales[ScaleName][ScaleKey];
  };
  [RegistriesCommand.getNamedScaleGroup]: { group: NamedScales[ScaleName] };

  // Sensor registry
  [RegistriesCommand.getAllSensors]: { sensors: readonly Sensor[] };
  [RegistriesCommand.getAllSensorScales]: { scales?: readonly Scale[] };
  [RegistriesCommand.getSensor]: { sensor?: Sensor };
  [RegistriesCommand.getSensorName]: { name: string };
  [RegistriesCommand.getSensorScale]: { scale?: Scale };
}

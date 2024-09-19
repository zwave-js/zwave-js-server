import { NamedScales, Notification } from "@zwave-js/core";
import { IncomingCommandBase } from "../incoming_message_base";
import { RegistriesCommand } from "./command";

export interface IncomingCommandRegistriesBase extends IncomingCommandBase {}

// Device class registry
export interface IncomingCommandRegistriesGetAllDeviceClasses
  extends IncomingCommandRegistriesBase {
  command: RegistriesCommand.getAllDeviceClasses;
}

export interface IncomingCommandRegistriesGetGenericDeviceClass
  extends IncomingCommandRegistriesBase {
  command: RegistriesCommand.getGenericDeviceClass;
  generic: number;
}

export interface IncomingCommandRegistriesGetSpecificDeviceClass
  extends IncomingCommandRegistriesBase {
  command: RegistriesCommand.getSpecificDeviceClass;
  generic: number;
  specific: number;
}

// Indicator registry
export interface IncomingCommandRegistriesGetAllIndicatorProperties
  extends IncomingCommandRegistriesBase {
  command: RegistriesCommand.getAllIndicatorProperties;
}

export interface IncomingCommandRegistriesGetIndicatorProperty
  extends IncomingCommandRegistriesBase {
  command: RegistriesCommand.getIndicatorProperty;
  id: number;
}

// Meter registry
export interface IncomingCommandRegistriesGetAllMeters
  extends IncomingCommandRegistriesBase {
  command: RegistriesCommand.getAllMeters;
}

export interface IncomingCommandRegistriesGetAllMeterScales
  extends IncomingCommandRegistriesBase {
  command: RegistriesCommand.getAllMeterScales;
  meterType: number;
}

export interface IncomingCommandRegistriesGetMeter
  extends IncomingCommandRegistriesBase {
  command: RegistriesCommand.getMeter;
  type: number;
}

export interface IncomingCommandRegistriesGetMeterName
  extends IncomingCommandRegistriesBase {
  command: RegistriesCommand.getMeterName;
  meterType: number;
}

export interface IncomingCommandRegistriesGetMeterScale
  extends IncomingCommandRegistriesBase {
  command: RegistriesCommand.getMeterScale;
  type: number;
  scale: number;
}

// Notification registry
export interface IncomingCommandRegistriesGetAllNotifications
  extends IncomingCommandRegistriesBase {
  command: RegistriesCommand.getAllNotifications;
}

export interface IncomingCommandRegistriesGetNotification
  extends IncomingCommandRegistriesBase {
  command: RegistriesCommand.getNotification;
  type: number;
}

export interface IncomingCommandRegistriesGetNotificationEventName
  extends IncomingCommandRegistriesBase {
  command: RegistriesCommand.getNotificationEventName;
  type: number;
  event: number;
}

export interface IncomingCommandRegistriesGetNotificationName
  extends IncomingCommandRegistriesBase {
  command: RegistriesCommand.getNotificationName;
  type: number;
}

export interface IncomingCommandRegistriesGetNotificationValue
  extends IncomingCommandRegistriesBase {
  command: RegistriesCommand.getNotificationValue;
  notification: Notification;
  value: number;
}

export interface IncomingCommandRegistriesGetNotificationValueName
  extends IncomingCommandRegistriesBase {
  command: RegistriesCommand.getNotificationValueName;
  type: number;
  event: number;
}

// Scales registry
export interface IncomingCommandRegistriesGetAllNamedScaleGroups
  extends IncomingCommandRegistriesBase {
  command: RegistriesCommand.getAllNamedScaleGroups;
}

export interface IncomingCommandRegistriesGetNamedScale
  extends IncomingCommandRegistriesBase {
  command: RegistriesCommand.getNamedScale;
  group: keyof NamedScales;
  key: keyof NamedScales[keyof NamedScales] & number;
}

export interface IncomingCommandRegistriesGetNamedScaleGroup
  extends IncomingCommandRegistriesBase {
  command: RegistriesCommand.getNamedScaleGroup;
  group: keyof NamedScales;
}

// Sensor registry
export interface IncomingCommandRegistriesGetAllSensors
  extends IncomingCommandRegistriesBase {
  command: RegistriesCommand.getAllSensors;
}

export interface IncomingCommandRegistriesGetAllSensorScales
  extends IncomingCommandRegistriesBase {
  command: RegistriesCommand.getAllSensorScales;
  sensorType: number;
}

export interface IncomingCommandRegistriesGetSensor
  extends IncomingCommandRegistriesBase {
  command: RegistriesCommand.getSensor;
  type: number;
}

export interface IncomingCommandRegistriesGetSensorName
  extends IncomingCommandRegistriesBase {
  command: RegistriesCommand.getSensorName;
  sensorType: number;
}

export interface IncomingCommandRegistriesGetSensorScale
  extends IncomingCommandRegistriesBase {
  command: RegistriesCommand.getSensorScale;
  type: number;
  scale: number;
}

export type IncomingMessageRegistries =
  | IncomingCommandRegistriesGetAllDeviceClasses
  | IncomingCommandRegistriesGetGenericDeviceClass
  | IncomingCommandRegistriesGetSpecificDeviceClass
  | IncomingCommandRegistriesGetAllIndicatorProperties
  | IncomingCommandRegistriesGetIndicatorProperty
  | IncomingCommandRegistriesGetAllMeters
  | IncomingCommandRegistriesGetAllMeterScales
  | IncomingCommandRegistriesGetMeter
  | IncomingCommandRegistriesGetMeterName
  | IncomingCommandRegistriesGetMeterScale
  | IncomingCommandRegistriesGetAllNotifications
  | IncomingCommandRegistriesGetNotification
  | IncomingCommandRegistriesGetNotificationEventName
  | IncomingCommandRegistriesGetNotificationName
  | IncomingCommandRegistriesGetNotificationValue
  | IncomingCommandRegistriesGetNotificationValueName
  | IncomingCommandRegistriesGetAllNamedScaleGroups
  | IncomingCommandRegistriesGetNamedScale
  | IncomingCommandRegistriesGetNamedScaleGroup
  | IncomingCommandRegistriesGetAllSensors
  | IncomingCommandRegistriesGetAllSensorScales
  | IncomingCommandRegistriesGetSensor
  | IncomingCommandRegistriesGetSensorName
  | IncomingCommandRegistriesGetSensorScale;

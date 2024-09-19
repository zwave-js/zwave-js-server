import {
  getAllDeviceClasses,
  getAllIndicatorProperties,
  getAllMeters,
  getAllMeterScales,
  getAllNamedScaleGroups,
  getAllNotifications,
  getAllSensors,
  getAllSensorScales,
  getGenericDeviceClass,
  getIndicatorProperty,
  getMeter,
  getMeterName,
  getMeterScale,
  getNamedScale,
  getNamedScaleGroup,
  getNotification,
  getNotificationEventName,
  getNotificationName,
  getNotificationValue,
  getNotificationValueName,
  getSensor,
  getSensorName,
  getSensorScale,
  getSpecificDeviceClass,
} from "@zwave-js/core";
import { UnknownCommandError } from "../error";
import { RegistriesCommand } from "./command";
import { IncomingMessageRegistries } from "./incoming_message";
import { RegistriesResultTypes } from "./outgoing_message";
import { MessageHandler } from "../message_handler";

export class RegistriesMessageHandler extends MessageHandler {
  async handle(
    message: IncomingMessageRegistries,
  ): Promise<RegistriesResultTypes[RegistriesCommand]> {
    const { command } = message;

    switch (message.command) {
      // Device class registry
      case RegistriesCommand.getAllDeviceClasses: {
        return { deviceClasses: getAllDeviceClasses() };
      }
      case RegistriesCommand.getGenericDeviceClass: {
        return { deviceClass: getGenericDeviceClass(message.generic) };
      }
      case RegistriesCommand.getSpecificDeviceClass: {
        return {
          deviceClass: getSpecificDeviceClass(
            message.generic,
            message.specific,
          ),
        };
      }

      // Indicator registry
      case RegistriesCommand.getAllIndicatorProperties: {
        return { indicatorProperties: getAllIndicatorProperties() };
      }
      case RegistriesCommand.getIndicatorProperty: {
        return { indicatorProperty: getIndicatorProperty(message.id) };
      }

      // Meter registry
      case RegistriesCommand.getAllMeters: {
        return { meters: getAllMeters() };
      }
      case RegistriesCommand.getAllMeterScales: {
        return { scales: getAllMeterScales(message.meterType) };
      }
      case RegistriesCommand.getMeter: {
        return { meter: getMeter(message.type) };
      }
      case RegistriesCommand.getMeterName: {
        return { name: getMeterName(message.meterType) };
      }
      case RegistriesCommand.getMeterScale: {
        return { scale: getMeterScale(message.type, message.scale) };
      }

      // Notification registry
      case RegistriesCommand.getAllNotifications: {
        return { notifications: getAllNotifications() };
      }
      case RegistriesCommand.getNotification: {
        return { notification: getNotification(message.type) };
      }
      case RegistriesCommand.getNotificationEventName: {
        return { name: getNotificationEventName(message.type, message.event) };
      }
      case RegistriesCommand.getNotificationName: {
        return { name: getNotificationName(message.type) };
      }
      case RegistriesCommand.getNotificationValue: {
        return {
          value: getNotificationValue(message.notification, message.value),
        };
      }
      case RegistriesCommand.getNotificationValueName: {
        return { name: getNotificationValueName(message.type, message.event) };
      }

      // Scale registry
      case RegistriesCommand.getAllNamedScaleGroups: {
        return { groups: getAllNamedScaleGroups() };
      }
      case RegistriesCommand.getNamedScale: {
        return { scale: getNamedScale(message.group, message.key) };
      }
      case RegistriesCommand.getNamedScaleGroup: {
        return { group: getNamedScaleGroup(message.group) };
      }

      // Sensor registry
      case RegistriesCommand.getAllSensors: {
        return { sensors: getAllSensors() };
      }
      case RegistriesCommand.getAllSensorScales: {
        return { scales: getAllSensorScales(message.sensorType) };
      }
      case RegistriesCommand.getSensor: {
        return { sensor: getSensor(message.type) };
      }
      case RegistriesCommand.getSensorName: {
        return { name: getSensorName(message.sensorType) };
      }
      case RegistriesCommand.getSensorScale: {
        return { scale: getSensorScale(message.type, message.scale) };
      }
      default: {
        throw new UnknownCommandError(command);
      }
    }
  }
}

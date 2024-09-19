export enum RegistriesCommand {
  // Device class registry
  getAllDeviceClasses = "registries.get_all_device_classes",
  getGenericDeviceClass = "registries.get_generic_device_class",
  getSpecificDeviceClass = "registries.get_specific_device_class",
  // Indicator registry
  getAllIndicatorProperties = "registries.get_all_indicator_properties",
  getIndicatorProperty = "registries.get_indicator_property",
  // Meter registry
  getAllMeters = "registries.get_all_meters",
  getAllMeterScales = "registries.get_all_meter_scales",
  getMeter = "registries.get_meter",
  getMeterName = "registries.get_meter_name",
  getMeterScale = "registries.get_meter_scale",
  // Notification registry
  getAllNotifications = "registries.get_all_notifications",
  getNotification = "registries.get_notification",
  getNotificationEventName = "registries.get_notification_event_name",
  getNotificationName = "registries.get_notification_name",
  getNotificationValue = "registries.get_notification_value",
  getNotificationValueName = "registries.get_notification_value_name",
  // Scales registry
  getAllNamedScaleGroups = "registries.get_all_named_scale_groups",
  getNamedScale = "registries.get_named_scale",
  getNamedScaleGroup = "registries.get_named_scale_group",
  // Sensor registry
  getAllSensors = "registries.get_all_sensors",
  getAllSensorScales = "registries.get_all_sensor_scales",
  getSensor = "registries.get_sensor",
  getSensorName = "registries.get_sensor_name",
  getSensorScale = "registries.get_sensor_scale",
}

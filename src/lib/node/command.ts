export enum NodeCommand {
  setValue = "node.set_value",
  refreshInfo = "node.refresh_info",
  getDefinedValueIDs = "node.get_defined_value_ids",
  getValueMetadata = "node.get_value_metadata",
  beginFirmwareUpdate = "node.begin_firmware_update",
  updateFirmware = "node.update_firmware",
  abortFirmwareUpdate = "node.abort_firmware_update",
  pollValue = "node.poll_value",
  setRawConfigParameterValue = "node.set_raw_config_parameter_value",
  refreshValues = "node.refresh_values",
  refreshCCValues = "node.refresh_cc_values",
  ping = "node.ping",
  getFirmwareUpdateCapabilities = "node.get_firmware_update_capabilities",
  getFirmwareUpdateCapabilitiesCached = "node.get_firmware_update_capabilities_cached",
  hasSecurityClass = "node.has_security_class",
  getHighestSecurityClass = "node.get_highest_security_class",
  testPowerlevel = "node.test_powerlevel",
  checkLifelineHealth = "node.check_lifeline_health",
  checkRouteHealth = "node.check_route_health",
  getValue = "node.get_value",
  getEndpointCount = "node.get_endpoint_count",
  interviewCC = "node.interview_cc",
  getState = "node.get_state",
  setName = "node.set_name",
  setLocation = "node.set_location",
  setKeepAwake = "node.set_keep_awake",
  getFirmwareUpdateProgress = "node.get_firmware_update_progress",
  isFirmwareUpdateInProgress = "node.is_firmware_update_in_progress",
  waitForWakeup = "node.wait_for_wakeup",
  interview = "node.interview",
  getValueTimestamp = "node.get_value_timestamp",
  manuallyIdleNotificationValue = "node.manually_idle_notification_value",
  setDateAndTime = "node.set_date_and_time",
  getDateAndTime = "node.get_date_and_time",
  isHealthCheckInProgress = "node.is_health_check_in_progress",
  abortHealthCheck = "node.abort_health_check",
}

export enum NodeCommand {
  setValue = "node.set_value",
  refreshInfo = "node.refresh_info",
  getDefinedValueIDs = "node.get_defined_value_ids",
  getValueMetadata = "node.get_value_metadata",
  beginFirmwareUpdate = "node.begin_firmware_update",
  abortFirmwareUpdate = "node.abort_firmware_update",
  pollValue = "node.poll_value",
  setRawConfigParameterValue = "node.set_raw_config_parameter_value",
  refreshValues = "node.refresh_values",
  refreshCCValues = "node.refresh_cc_values",
  ping = "node.ping",
  getFirmwareUpdateCapabilities = "node.get_firmware_update_capabilities",
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
  getFirmwareUpdateInProgress = "node.get_firmware_update_in_progress",
}

export enum NodeCommand {
  setValue = "node.set_value",
  refreshInfo = "node.refresh_info",
  getDefinedValueIDs = "node.get_defined_value_ids",
  getValueMetadata = "node.get_value_metadata",
  abortFirmwareUpdate = "node.abort_firmware_update",
  pollValue = "node.poll_value",
  setRawConfigParameterValue = "node.set_raw_config_parameter_value",
  refreshValues = "node.refresh_values",
  refreshCCValues = "node.refresh_cc_values",
}

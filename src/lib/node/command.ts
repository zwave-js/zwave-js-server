export enum NodeCommand {
  setValue = "node.set_value",
  refreshInfo = "node.refresh_info",
  getDefinedValueIDs = "node.get_defined_value_ids",
  getValueMetadata = "node.get_value_metadata",
  beginFirmwareUpdateGuessFormat = "node.begin_firmware_update_guess_format",
  beginFirmwareUpdateKnownFormat = "node.begin_firmware_update_known_format",
  abortFirmwareUpdate = "node.abort_firmware_update",
  pollValue = "node.poll_value",
  setRawConfigParameterValue = "node.set_raw_config_parameter_value",
  refreshValues = "node.refresh_values",
  refreshCCValues = "node.refresh_cc_values",
}

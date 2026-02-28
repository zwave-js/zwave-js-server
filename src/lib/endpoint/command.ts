export enum EndpointCommand {
  invokeCCAPI = "endpoint.invoke_cc_api",
  supportsCCAPI = "endpoint.supports_cc_api",
  supportsCC = "endpoint.supports_cc",
  controlsCC = "endpoint.controls_cc",
  isCCSecure = "endpoint.is_cc_secure",
  getCCVersion = "endpoint.get_cc_version",
  getNodeUnsafe = "endpoint.get_node_unsafe",
  tryGetNode = "endpoint.try_get_node",
  setRawConfigParameterValue = "endpoint.set_raw_config_parameter_value",
  getRawConfigParameterValue = "endpoint.get_raw_config_parameter_value",
  // Undocumented
  getCCs = "endpoint.get_ccs",
  // Undocumented
  maySupportBasicCC = "endpoint.may_support_basic_cc",
  // Undocumented
  wasCCRemovedViaConfig = "endpoint.was_cc_removed_via_config",
}

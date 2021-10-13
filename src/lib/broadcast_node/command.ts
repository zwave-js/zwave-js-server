export enum BroadcastNodeCommand {
  setValue = "broadcast_node.set_value",
  getEndpointCount = "broadcast_node.get_endpoint_count",
  supportsCC = "broadcast_node.supports_cc",
  getCCVersion = "broadcast_node.get_cc_version",
  invokeCCAPI = "broadcast_node.invoke_cc_api",
  supportsCCAPI = "broadcast_node.supports_cc_api",
  getDefinedValueIDs = "multicast_group.get_defined_value_ids",
}

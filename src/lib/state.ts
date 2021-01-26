import {
  Driver,
  ZWaveController,
  ZWaveNode,
  Endpoint,
  TranslatedValueID,
  ValueMetadata,
} from "zwave-js";

export interface ZwaveState {
  driver: Partial<Driver>;
  controller: Partial<ZWaveController>;
  nodes: Partial<ZWaveNode>[];
}

interface EndpointState extends Partial<Endpoint> {}

interface ValueState extends Partial<TranslatedValueID> {
  metadata: ValueMetadata;
  value: any;
  ccVersion: number;
}

interface NodeState extends Partial<ZWaveNode> {
  endpoints: EndpointState[];
  values: ValueState[];
}

function getNodeValues(node: ZWaveNode): ValueState[] {
  const result = [];
  for (const valueId of node.getDefinedValueIDs()) {
    const valueState = valueId as ValueState;
    valueState.metadata = node.getValueMetadata(valueId);
    valueState.value = node.getValue(valueId);
    // get CC Version for this endpoint, fallback to CC version of the node itself
    valueState.ccVersion =
      node.getEndpoint(valueId.endpoint)?.getCCVersion(valueId.commandClass) ||
      node.getEndpoint(0)?.getCCVersion(valueId.commandClass);
    result.push(valueState);
  }
  return result;
}

export const dumpNode = (node: ZWaveNode): NodeState => ({
  nodeId: node.nodeId,
  index: node.index,
  installerIcon: node.installerIcon,
  userIcon: node.userIcon,
  status: node.status,
  ready: node.ready,
  deviceClass: node.deviceClass,
  isListening: node.isListening,
  isFrequentListening: node.isFrequentListening,
  isRouting: node.isRouting,
  maxBaudRate: node.maxBaudRate,
  isSecure: node.isSecure,
  version: node.version,
  isBeaming: node.isBeaming,
  manufacturerId: node.manufacturerId,
  productId: node.productId,
  productType: node.productType,
  firmwareVersion: node.firmwareVersion,
  zwavePlusVersion: node.zwavePlusVersion,
  nodeType: node.nodeType,
  roleType: node.roleType,
  name: node.name,
  location: node.location,
  deviceConfig: node.deviceConfig,
  label: node.label,
  neighbors: node.neighbors,
  endpointCountIsDynamic: node.endpointCountIsDynamic,
  endpointsHaveIdenticalCapabilities: node.endpointsHaveIdenticalCapabilities,
  individualEndpointCount: node.individualEndpointCount,
  aggregatedEndpointCount: node.aggregatedEndpointCount,
  interviewAttempts: node.interviewAttempts,
  endpoints: Array.from(node.getAllEndpoints(), (endpoint) =>
    dumpEndpoint(endpoint)
  ),
  values: getNodeValues(node),
});

export const dumpEndpoint = (endpoint: Endpoint): EndpointState => ({
  nodeId: endpoint.nodeId,
  index: endpoint.index,
  installerIcon: endpoint.installerIcon,
  userIcon: endpoint.userIcon,
});

export const dumpState = (driver: Driver): ZwaveState => {
  const controller = driver.controller;
  return {
    driver: {
      allNodesReady: driver.allNodesReady,
    },
    controller: {
      libraryVersion: controller.libraryVersion,
      type: controller.type,
      homeId: controller.homeId,
      ownNodeId: controller.ownNodeId,
      isSecondary: controller.isSecondary,
      isUsingHomeIdFromOtherNetwork: controller.isUsingHomeIdFromOtherNetwork,
      isSISPresent: controller.isSISPresent,
      wasRealPrimary: controller.wasRealPrimary,
      isStaticUpdateController: controller.isStaticUpdateController,
      isSlave: controller.isSlave,
      serialApiVersion: controller.serialApiVersion,
      manufacturerId: controller.manufacturerId,
      productType: controller.productType,
      productId: controller.productId,
      supportedFunctionTypes: controller.supportedFunctionTypes,
      sucNodeId: controller.sucNodeId,
      supportsTimers: controller.supportsTimers,
    },
    nodes: Array.from(controller.nodes.values(), (node) => dumpNode(node)),
  };
};

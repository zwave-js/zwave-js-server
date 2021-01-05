import { Driver, ZWaveController, ZWaveNode } from "zwave-js";

export interface ZwaveState {
  controller: Partial<ZWaveController>;
  nodes: Record<number, Partial<ZWaveNode>>;
}

export const dumpNode = (node: ZWaveNode): Partial<ZWaveNode> => ({
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
});

export const dumpState = (driver: Driver) => {
  const controller = driver.controller;

  const state: ZwaveState = {
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
    nodes: {},
  };

  controller.nodes.forEach((node) => {
    state.nodes[node.nodeId] = dumpNode(node);
  });

  return state;
};

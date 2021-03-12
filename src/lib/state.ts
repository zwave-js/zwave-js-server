import {
  Driver,
  ZWaveController,
  ZWaveNode,
  Endpoint,
  TranslatedValueID,
  ValueMetadata,
  DeviceClass,
  CommandClass,
} from "zwave-js";
import { CommandClasses } from "@zwave-js/core";
import { getTransformedValueMetadata } from "../util/metadata_handler";

type Modify<T, R> = Omit<T, keyof R> & R;

export interface ZwaveState {
  controller: {
    libraryVersion: ZWaveController["libraryVersion"];
    type: ZWaveController["type"];
    homeId: ZWaveController["homeId"];
    ownNodeId: ZWaveController["ownNodeId"];
    isSecondary: ZWaveController["isSecondary"];
    isUsingHomeIdFromOtherNetwork: ZWaveController["isUsingHomeIdFromOtherNetwork"];
    isSISPresent: ZWaveController["isSISPresent"];
    wasRealPrimary: ZWaveController["wasRealPrimary"];
    isStaticUpdateController: ZWaveController["isStaticUpdateController"];
    isSlave: ZWaveController["isSlave"];
    serialApiVersion: ZWaveController["serialApiVersion"];
    manufacturerId: ZWaveController["manufacturerId"];
    productType: ZWaveController["productType"];
    productId: ZWaveController["productId"];
    supportedFunctionTypes: ZWaveController["supportedFunctionTypes"];
    sucNodeId: ZWaveController["sucNodeId"];
    supportsTimers: ZWaveController["supportsTimers"];
  };
  nodes: NodeState[];
}

interface CommandClassState {
  id: number;
  name: string;
  version: number;
  isSecure: boolean;
}

interface EndpointState {
  nodeId: Endpoint["nodeId"];
  index: Endpoint["index"];
  installerIcon: Endpoint["installerIcon"];
  userIcon: Endpoint["userIcon"];
}

interface DeviceClassState {
  basic: {
    key: number;
    label: string;
  };
  generic: {
    key: number;
    label: string;
  };
  specific: {
    key: number;
    label: string;
  };
  mandatorySupportedCCs: DeviceClass["mandatorySupportedCCs"];
  mandatoryControlledCCs: DeviceClass["mandatoryControlledCCs"];
}

interface ValueState extends TranslatedValueID {
  metadata: ValueMetadata;
  ccVersion: number;
  value?: any;
}

interface NodeStateSchema0 {
  nodeId: ZWaveNode["nodeId"];
  index: ZWaveNode["index"];
  installerIcon: ZWaveNode["installerIcon"];
  userIcon: ZWaveNode["userIcon"];
  status: ZWaveNode["status"];
  ready: ZWaveNode["ready"];
  isListening: ZWaveNode["isListening"];
  isFrequentListening: ZWaveNode["isFrequentListening"];
  isRouting: ZWaveNode["isRouting"];
  maxBaudRate: ZWaveNode["maxBaudRate"];
  isSecure: ZWaveNode["isSecure"];
  version: ZWaveNode["version"];
  isBeaming: ZWaveNode["isBeaming"];
  manufacturerId: ZWaveNode["manufacturerId"];
  productId: ZWaveNode["productId"];
  productType: ZWaveNode["productType"];
  firmwareVersion: ZWaveNode["firmwareVersion"];
  zwavePlusVersion: ZWaveNode["zwavePlusVersion"];
  nodeType: ZWaveNode["nodeType"];
  roleType: ZWaveNode["roleType"];
  name: ZWaveNode["name"];
  location: ZWaveNode["location"];
  deviceConfig: ZWaveNode["deviceConfig"];
  label: ZWaveNode["label"];
  neighbors: ZWaveNode["neighbors"];
  endpointCountIsDynamic: ZWaveNode["endpointCountIsDynamic"];
  endpointsHaveIdenticalCapabilities: ZWaveNode["endpointsHaveIdenticalCapabilities"];
  individualEndpointCount: ZWaveNode["individualEndpointCount"];
  aggregatedEndpointCount: ZWaveNode["aggregatedEndpointCount"];
  interviewAttempts: ZWaveNode["interviewAttempts"];
  interviewStage: ZWaveNode["interviewStage"];

  deviceClass: DeviceClass | null;

  endpoints: EndpointState[];
  values: ValueState[];
}

type NodeStateSchema1 = Modify<
  NodeStateSchema0,
  { deviceClass: DeviceClassState | null; commandClasses: CommandClassState[] }
>;

type NodeState = NodeStateSchema0 | NodeStateSchema1;

function getNodeValues(node: ZWaveNode, schemaVersion: number): ValueState[] {
  if (!node.ready) {
    // guard: do not request all values (and their metadata) while the node is still being interviewed.
    // once the node hits ready state, all values will be sent in the 'node ready' event.
    return [];
  }
  return Array.from(node.getDefinedValueIDs(), (valueId) =>
    dumpValue(node, valueId, schemaVersion)
  );
}

export const dumpValue = (
  node: ZWaveNode,
  valueArgs: TranslatedValueID,
  schemaVersion: number
): ValueState => {
  // get CC Version for this endpoint, fallback to CC version of the node itself
  let ccVersion: number | undefined;

  if (valueArgs.endpoint !== undefined) {
    ccVersion = node
      .getEndpoint(valueArgs.endpoint)
      ?.getCCVersion(valueArgs.commandClass);
  }

  if (ccVersion === undefined) {
    ccVersion = node.getEndpoint(0).getCCVersion(valueArgs.commandClass);
  }

  return {
    endpoint: valueArgs.endpoint,
    commandClass: valueArgs.commandClass,
    commandClassName: valueArgs.commandClassName,
    property: valueArgs.property,
    propertyKey: valueArgs.propertyKey,
    propertyName: valueArgs.propertyName,
    propertyKeyName: valueArgs.propertyKeyName,
    ccVersion,
    // append metadata
    metadata: getTransformedValueMetadata(node, valueArgs, schemaVersion),
    // append actual value
    value: node.getValue(valueArgs),
  };
};

export const dumpNode = (
  node: ZWaveNode,
  schemaVersion: number
): NodeStateSchema0 | NodeStateSchema1 => {
  const base: Partial<NodeStateSchema0> = {
    nodeId: node.nodeId,
    index: node.index,
    installerIcon: node.installerIcon,
    userIcon: node.userIcon,
    status: node.status,
    ready: node.ready,
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
    interviewStage: node.interviewStage,
    endpoints: Array.from(node.getAllEndpoints(), (endpoint) =>
      dumpEndpoint(endpoint)
    ),
    values: getNodeValues(node, schemaVersion),
  };

  if (schemaVersion == 0) {
    const node0 = base as NodeStateSchema0;
    node0.deviceClass = node.deviceClass || null;
    return node0;
  }

  // Schema >= 1
  const node1 = base as NodeStateSchema1;
  node1.deviceClass = node.deviceClass
    ? dumpDeviceClass(node.deviceClass)
    : null;
  node1.commandClasses = Array.from(node.getSupportedCCInstances(), (cc) =>
    dumpCommandClass(node, cc)
  );

  return node1;
};

export const dumpEndpoint = (endpoint: Endpoint): EndpointState => ({
  nodeId: endpoint.nodeId,
  index: endpoint.index,
  installerIcon: endpoint.installerIcon,
  userIcon: endpoint.userIcon,
});

export const dumpDeviceClass = (
  deviceClass: DeviceClass
): DeviceClassState => ({
  basic: {
    key: deviceClass.basic.key,
    label: deviceClass.basic.label,
  },
  generic: {
    key: deviceClass.generic.key,
    label: deviceClass.generic.label,
  },
  specific: {
    key: deviceClass.specific.key,
    label: deviceClass.specific.label,
  },
  mandatorySupportedCCs: deviceClass.mandatorySupportedCCs,
  mandatoryControlledCCs: deviceClass.mandatoryControlledCCs,
});

export const dumpCommandClass = (
  node: ZWaveNode,
  commandClass: CommandClass
): CommandClassState => ({
  id: commandClass.ccId,
  name: CommandClasses[commandClass.ccId],
  version: commandClass.version,
  isSecure: node.isCCSecure(commandClass.ccId),
});

export const dumpState = (
  driver: Driver,
  schemaVersion: number
): ZwaveState => {
  const controller = driver.controller;
  return {
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
    nodes: Array.from(controller.nodes.values(), (node) =>
      dumpNode(node, schemaVersion)
    ),
  };
};

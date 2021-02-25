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

type Modify<T, R> = Omit<T, keyof R> & R;

export interface ZwaveState {
  controller: Partial<ZWaveController>;
  nodes: NodeState[];
}

interface CommandClassState {
  id: number;
  name: string;
  version: number;
  isSecure: boolean;
}

type EndpointState = Partial<Endpoint>;

type DeviceClassState = Partial<
  Modify<
    DeviceClass,
    {
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
    }
  >
>;

interface ValueState extends TranslatedValueID {
  metadata: ValueMetadata;
  ccVersion: number;
  value?: any;
}

type NodeState = Partial<
  Modify<
    ZWaveNode,
    {
      deviceClassFull: DeviceClassState;
      commandClasses: CommandClassState[];
      endpoints: EndpointState[];
      values: ValueState[];
    }
  >
>;

function getNodeValues(node: ZWaveNode): ValueState[] {
  if (!node.ready) {
    // guard: do not request all values (and their metadata) while the node is still being interviewed.
    // once the node hits ready state, all values will be sent in the 'node ready' event.
    return [];
  }
  return Array.from(node.getDefinedValueIDs(), (valueId) =>
    dumpValue(node, valueId)
  );
}

export const dumpValue = (
  node: ZWaveNode,
  valueArgs: TranslatedValueID
): ValueState => ({
  endpoint: valueArgs.endpoint,
  commandClass: valueArgs.commandClass,
  commandClassName: valueArgs.commandClassName,
  property: valueArgs.property,
  propertyKey: valueArgs.propertyKey,
  propertyName: valueArgs.propertyName,
  propertyKeyName: valueArgs.propertyKeyName,
  // get CC Version for this endpoint, fallback to CC version of the node itself
  ccVersion:
    node
      .getEndpoint(valueArgs.endpoint)
      ?.getCCVersion(valueArgs.commandClass) ||
    node.getEndpoint(0).getCCVersion(valueArgs.commandClass),
  // append metadata
  metadata: node.getValueMetadata(valueArgs),
  // append actual value
  value: node.getValue(valueArgs),
});

export const dumpNode = (node: ZWaveNode): NodeState => ({
  nodeId: node.nodeId,
  index: node.index,
  installerIcon: node.installerIcon,
  userIcon: node.userIcon,
  status: node.status,
  ready: node.ready,
  // This is for legacy compat with server < 1.0.0
  deviceClass: node.deviceClass,
  deviceClassFull: dumpDeviceClass(node.deviceClass),
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
  commandClasses: Array.from(node.getSupportedCCInstances(), (cc) =>
    dumpCommandClass(node, cc)
  ),
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

export const dumpState = (driver: Driver): ZwaveState => {
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
    nodes: Array.from(controller.nodes.values(), (node) => dumpNode(node)),
  };
};

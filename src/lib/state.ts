import {
  Driver,
  ZWaveController,
  ZWaveNode,
  Endpoint,
  TranslatedValueID,
  ValueMetadata,
  DeviceClass,
  CommandClass,
  InterviewStage,
} from "zwave-js";
import {
  CommandClasses,
  ConfigurationMetadata,
  ConfigValue,
  ConfigValueFormat,
  LogConfig,
  ValueMetadataAny,
  ValueMetadataBoolean,
  ValueMetadataBuffer,
  ValueMetadataDuration,
  ValueMetadataNumeric,
  ValueMetadataString,
} from "@zwave-js/core";
import { numberFromLogLevel } from "../util/logger";

type Modify<T, R> = Omit<T, keyof R> & R;

type LogConfigState = Omit<LogConfig, "transports">;
export interface DriverState {
  logConfig: LogConfigState;
  statisticsEnabled: boolean;
}

export interface ZwaveState {
  driver: DriverState;
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
    isHealNetworkActive: ZWaveController["isHealNetworkActive"];
  };
  nodes: NodeState[];
}

interface CommandClassState {
  id: number;
  name: string;
  version: number;
  isSecure: boolean;
}

interface EndpointStateSchema0 {
  nodeId: Endpoint["nodeId"];
  index: Endpoint["index"];
  installerIcon: Endpoint["installerIcon"];
  userIcon: Endpoint["userIcon"];
}

type EndpointStateSchema1 = Modify<
  EndpointStateSchema0,
  { deviceClass: DeviceClassState | null }
>;

type EndpointState = EndpointStateSchema0 | EndpointStateSchema1;

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

interface MetadataState {
  type: ValueMetadata["type"];
  default?: ValueMetadata["default"];
  readable: ValueMetadata["readable"];
  writeable: ValueMetadata["writeable"];
  description?: ValueMetadata["description"];
  label?: ValueMetadata["label"];
  ccSpecific?: ValueMetadata["ccSpecific"];
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  steps?: number;
  states?: Record<number, string>;
  unit?: string;
}

interface ConfigurationMetadataState {
  type: ConfigurationMetadata["type"];
  readable: boolean;
  writeable: boolean;
  description?: string;
  label?: string;
  ccSpecific?: Record<string, any>;
  min?: ConfigValue;
  max?: ConfigValue;
  default?: ConfigValue;
  unit?: string;
  valueSize?: number;
  format?: ConfigValueFormat;
  name?: string;
  info?: string;
  noBulkSupport?: boolean;
  isAdvanced?: boolean;
  requiresReInclusion?: boolean;
  states?: Record<number, string>;
  allowManualEntry?: boolean;
  isFromConfig?: boolean;
}

interface NodeStateSchema0 {
  nodeId: ZWaveNode["nodeId"];
  index: ZWaveNode["index"];
  installerIcon: ZWaveNode["installerIcon"];
  userIcon: ZWaveNode["userIcon"];
  status: ZWaveNode["status"];
  ready: ZWaveNode["ready"];
  isListening: ZWaveNode["isListening"];
  isFrequentListening: boolean | null;
  isRouting: ZWaveNode["isRouting"];
  maxBaudRate: ZWaveNode["maxDataRate"];
  isSecure: ZWaveNode["isSecure"];
  version: number | null;
  isBeaming: ZWaveNode["supportsBeaming"];
  manufacturerId: ZWaveNode["manufacturerId"];
  productId: ZWaveNode["productId"];
  productType: ZWaveNode["productType"];
  firmwareVersion: ZWaveNode["firmwareVersion"];
  zwavePlusVersion: ZWaveNode["zwavePlusVersion"];
  nodeType: ZWaveNode["zwavePlusNodeType"];
  roleType: ZWaveNode["zwavePlusRoleType"];
  name: ZWaveNode["name"];
  location: ZWaveNode["location"];
  deviceConfig: ZWaveNode["deviceConfig"];
  label: ZWaveNode["label"];
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

type NodeStateSchema2 = NodeStateSchema1;

type NodeStateSchema3 = Omit<
  Modify<
    NodeStateSchema2,
    {
      isFrequentListening: ZWaveNode["isFrequentListening"];
      maxDataRate: ZWaveNode["maxDataRate"];
      supportedDataRates: ZWaveNode["supportedDataRates"];
      protocolVersion: ZWaveNode["protocolVersion"];
      supportsBeaming: ZWaveNode["supportsBeaming"];
      supportsSecurity: ZWaveNode["supportsSecurity"];
      zwavePlusNodeType: ZWaveNode["zwavePlusNodeType"];
      zwavePlusRoleType: ZWaveNode["zwavePlusRoleType"];
      nodeType: ZWaveNode["nodeType"];
    }
  >,
  "maxBaudRate" | "version" | "isBeaming" | "roleType"
>;

type NodeStateSchema4 = Modify<NodeStateSchema3, { interviewStage?: string }>;

type NodeStateSchema5 = Modify<
  NodeStateSchema4,
  { deviceDatabaseUrl: ZWaveNode["deviceDatabaseUrl"] }
>;

type NodeState =
  | NodeStateSchema0
  | NodeStateSchema1
  | NodeStateSchema2
  | NodeStateSchema3
  | NodeStateSchema4
  | NodeStateSchema5;

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

  let metadata: ValueMetadata | ConfigurationMetadata;

  if (valueArgs.commandClass === CommandClasses.Configuration) {
    metadata = dumpConfigurationMetadata(
      node.getValueMetadata(valueArgs) as ConfigurationMetadata,
      schemaVersion
    );
  } else {
    metadata = dumpMetadata(node.getValueMetadata(valueArgs), schemaVersion);
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
    metadata,
    // append actual value
    value: node.getValue(valueArgs),
  };
};

export const dumpConfigurationMetadata = (
  metadata: ConfigurationMetadata,
  schemaVersion: number
): ConfigurationMetadataState => {
  let newMetadata: ConfigurationMetadataState = {
    type: metadata.type,
    readable: metadata.readable,
    writeable: metadata.writeable,
    description: metadata.description,
    label: metadata.label,
    ccSpecific: metadata.ccSpecific,
    default: metadata.default,
    min: metadata.min,
    max: metadata.max,
    states: metadata.states,
    unit: metadata.unit,
    valueSize: metadata.valueSize,
    format: metadata.format,
    name: metadata.name,
    info: metadata.info,
    noBulkSupport: metadata.noBulkSupport,
    isAdvanced: metadata.isAdvanced,
    requiresReInclusion: metadata.requiresReInclusion,
    allowManualEntry: metadata.allowManualEntry,
    isFromConfig: metadata.isFromConfig,
  };

  if (schemaVersion < 2 && newMetadata.type === "buffer") {
    newMetadata.type = "string";
  }

  return newMetadata;
};

export const dumpMetadata = (
  metadata:
    | ValueMetadataAny
    | ValueMetadataBoolean
    | ValueMetadataBuffer
    | ValueMetadataDuration
    | ValueMetadataNumeric
    | ValueMetadataString,
  schemaVersion: number
): MetadataState => {
  let newMetadata: MetadataState = {
    type: metadata.type,
    default: metadata.default,
    readable: metadata.readable,
    writeable: metadata.writeable,
    description: metadata.description,
    label: metadata.label,
    ccSpecific: metadata.ccSpecific,
  };

  if ("min" in metadata) {
    newMetadata.min = metadata.min;
  }

  if ("max" in metadata) {
    newMetadata.max = metadata.max;
  }

  if ("minLength" in metadata) {
    newMetadata.minLength = metadata.minLength;
  }

  if ("maxLength" in metadata) {
    newMetadata.maxLength = metadata.maxLength;
  }

  if ("steps" in metadata) {
    newMetadata.steps = metadata.steps;
  }

  if ("states" in metadata) {
    newMetadata.states = { ...metadata.states };
  }

  if ("unit" in metadata) {
    newMetadata.unit = metadata.unit;
  }

  if (schemaVersion < 2 && newMetadata.type === "buffer") {
    newMetadata.type = "string";
  }

  return newMetadata;
};

export const dumpNode = (node: ZWaveNode, schemaVersion: number): NodeState => {
  const base: Partial<NodeStateSchema0> = {
    nodeId: node.nodeId,
    index: node.index,
    installerIcon: node.installerIcon,
    userIcon: node.userIcon,
    status: node.status,
    ready: node.ready,
    isListening: node.isListening,
    isRouting: node.isRouting,
    isSecure: node.isSecure,
    manufacturerId: node.manufacturerId,
    productId: node.productId,
    productType: node.productType,
    firmwareVersion: node.firmwareVersion,
    zwavePlusVersion: node.zwavePlusVersion,
    name: node.name,
    location: node.location,
    deviceConfig: node.deviceConfig,
    label: node.label,
    endpointCountIsDynamic: node.endpointCountIsDynamic,
    endpointsHaveIdenticalCapabilities: node.endpointsHaveIdenticalCapabilities,
    individualEndpointCount: node.individualEndpointCount,
    aggregatedEndpointCount: node.aggregatedEndpointCount,
    interviewAttempts: node.interviewAttempts,
    endpoints: Array.from(node.getAllEndpoints(), (endpoint) =>
      dumpEndpoint(endpoint, schemaVersion)
    ),
    values: getNodeValues(node, schemaVersion),
  };

  // In schema 4 we started using the interview stage string instead of the enum number
  if (schemaVersion <= 3) base.interviewStage = node.interviewStage;

  // Handle schema 3 changes by transforming them into the properties that schema < 3 expects.
  if (schemaVersion < 3) {
    base.isFrequentListening = node.isFrequentListening
      ? Boolean(node.isFrequentListening)
      : null;
    base.maxBaudRate = node.maxDataRate;
    base.version = node.protocolVersion ? node.protocolVersion + 1 : null;
    base.isBeaming = node.supportsBeaming;
    base.nodeType = node.zwavePlusNodeType;
    base.roleType = node.zwavePlusRoleType;
  }

  if (schemaVersion == 0) {
    const node0 = base as NodeStateSchema0;
    node0.deviceClass = node.deviceClass || null;
    return node0;
  }

  // All schemas >= 1
  if (schemaVersion <= 2) {
    const node1 = base as NodeStateSchema1;
    node1.deviceClass = node.deviceClass
      ? dumpDeviceClass(node.deviceClass)
      : null;
    node1.commandClasses = Array.from(node.getSupportedCCInstances(), (cc) =>
      dumpCommandClass(node, cc)
    );
    return node1;
  }

  if (schemaVersion == 3) {
    const node3 = base as NodeStateSchema3;

    // Add or update changed keys
    node3.isFrequentListening = node.isFrequentListening;
    node3.maxDataRate = node.maxDataRate;
    node3.supportedDataRates = node.supportedDataRates;
    node3.protocolVersion = node.protocolVersion;
    node3.supportsBeaming = node.supportsBeaming;
    node3.supportsSecurity = node.supportsSecurity;
    node3.nodeType = node.nodeType;
    node3.zwavePlusNodeType = node.zwavePlusNodeType;
    node3.zwavePlusRoleType = node.zwavePlusRoleType;
    node3.deviceClass = node.deviceClass
      ? dumpDeviceClass(node.deviceClass)
      : null;
    node3.commandClasses = Array.from(node.getSupportedCCInstances(), (cc) =>
      dumpCommandClass(node, cc)
    );
    return node3;
  }

  if (schemaVersion == 4) {
    const node4 = base as NodeStateSchema4;
    node4.isFrequentListening = node.isFrequentListening;
    node4.maxDataRate = node.maxDataRate;
    node4.supportedDataRates = node.supportedDataRates;
    node4.protocolVersion = node.protocolVersion;
    node4.supportsBeaming = node.supportsBeaming;
    node4.supportsSecurity = node.supportsSecurity;
    node4.nodeType = node.nodeType;
    node4.zwavePlusNodeType = node.zwavePlusNodeType;
    node4.zwavePlusRoleType = node.zwavePlusRoleType;
    node4.deviceClass = node.deviceClass
      ? dumpDeviceClass(node.deviceClass)
      : null;
    node4.commandClasses = Array.from(node.getSupportedCCInstances(), (cc) =>
      dumpCommandClass(node, cc)
    );
    node4.interviewStage = InterviewStage[node.interviewStage];
    return node4;
  }

  const node5 = base as NodeStateSchema5;
  node5.isFrequentListening = node.isFrequentListening;
  node5.maxDataRate = node.maxDataRate;
  node5.supportedDataRates = node.supportedDataRates;
  node5.protocolVersion = node.protocolVersion;
  node5.supportsBeaming = node.supportsBeaming;
  node5.supportsSecurity = node.supportsSecurity;
  node5.nodeType = node.nodeType;
  node5.zwavePlusNodeType = node.zwavePlusNodeType;
  node5.zwavePlusRoleType = node.zwavePlusRoleType;
  node5.deviceClass = node.deviceClass
    ? dumpDeviceClass(node.deviceClass)
    : null;
  node5.commandClasses = Array.from(node.getSupportedCCInstances(), (cc) =>
    dumpCommandClass(node, cc)
  );
  node5.interviewStage = InterviewStage[node.interviewStage];
  node5.deviceDatabaseUrl = node.deviceDatabaseUrl;
  return node5;
};

export const dumpEndpoint = (
  endpoint: Endpoint,
  schemaVersion: number
): EndpointState => {
  let base: EndpointStateSchema0 = {
    nodeId: endpoint.nodeId,
    index: endpoint.index,
    installerIcon: endpoint.installerIcon,
    userIcon: endpoint.userIcon,
  };
  if (schemaVersion < 3) {
    return base as EndpointStateSchema0;
  }
  const endpoint3 = base as EndpointStateSchema1;
  endpoint3.deviceClass = endpoint.deviceClass
    ? dumpDeviceClass(endpoint.deviceClass)
    : null;
  return endpoint3;
};

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

export const dumpLogConfig = (
  driver: Driver,
  schemaVersion: number
): LogConfigState => {
  const { transports, ...partialLogConfig } = driver.getLogConfig();
  if (schemaVersion < 3 && typeof partialLogConfig.level === "string") {
    let levelNum = numberFromLogLevel(partialLogConfig.level);
    if (levelNum != undefined) {
      partialLogConfig.level = levelNum;
    }
  }
  return partialLogConfig;
};

export const dumpDriver = (
  driver: Driver,
  schemaVersion: number
): DriverState => {
  return {
    logConfig: dumpLogConfig(driver, schemaVersion),
    statisticsEnabled: driver.statisticsEnabled,
  };
};

export const dumpState = (
  driver: Driver,
  schemaVersion: number
): ZwaveState => {
  const controller = driver.controller;
  return {
    driver: dumpDriver(driver, schemaVersion),
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
      isHealNetworkActive: controller.isHealNetworkActive,
    },
    nodes: Array.from(controller.nodes.values(), (node) =>
      dumpNode(node, schemaVersion)
    ),
  };
};

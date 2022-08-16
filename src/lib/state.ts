import {
  Driver,
  ZWaveNode,
  Endpoint,
  TranslatedValueID,
  ValueMetadata,
  DeviceClass,
  CommandClass,
  InterviewStage,
  ZWaveLibraryTypes,
  FunctionType,
  ValueType,
  NodeStatus,
  DataRate,
  ZWavePlusNodeType,
  ZWavePlusRoleType,
  FLiRS,
  ProtocolVersion,
  NodeType,
  NodeStatistics,
  ControllerStatistics,
  InclusionState,
  FoundNode,
} from "zwave-js";
import { DeviceConfig } from "@zwave-js/config";
import {
  CommandClasses,
  ConfigurationMetadata,
  ConfigValue,
  ConfigValueFormat,
  LogConfig,
  Maybe,
  SecurityClass,
  ValueChangeOptions,
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

export interface ControllerStateSchema0 {
  libraryVersion?: string;
  type?: ZWaveLibraryTypes;
  homeId?: number;
  ownNodeId?: number;
  isSecondary?: boolean;
  isUsingHomeIdFromOtherNetwork?: boolean;
  isSISPresent?: boolean;
  wasRealPrimary?: boolean;
  isStaticUpdateController?: boolean;
  isSlave?: boolean;
  serialApiVersion?: string;
  manufacturerId?: number;
  productType?: number;
  productId?: number;
  supportedFunctionTypes?: readonly FunctionType[];
  sucNodeId?: number;
  supportsTimers?: boolean;
  isHealNetworkActive: boolean;
  statistics: ControllerStatistics;
  inclusionState: InclusionState;
}

type ControllerStateSchema16 = Omit<
  Modify<
    ControllerStateSchema0,
    {
      sdkVersion?: string;
      firmwareVersion?: string;
    }
  >,
  "libraryVersion" | "serialApiVersion"
>;

type ControllerStateSchema22 = Omit<
  Modify<
    ControllerStateSchema16,
    {
      isPrimary?: boolean;
      isSUC?: boolean;
      nodeType?: NodeType;
    }
  >,
  "isSlave" | "isSecondary" | "isStaticUpdateController"
>;

export type ControllerState =
  | ControllerStateSchema0
  | ControllerStateSchema16
  | ControllerStateSchema22;

export interface ZwaveState {
  driver: DriverState;
  controller: ControllerState;
  nodes: NodeState[];
}

interface CommandClassState {
  id: number;
  name: string;
  version: number;
  isSecure: boolean;
}

interface EndpointStateSchema0 {
  nodeId: number;
  index: number;
  installerIcon?: number;
  userIcon?: number;
}

type EndpointStateSchema1 = Modify<
  EndpointStateSchema0,
  { deviceClass: DeviceClassState | null }
>;

type EndpointStateSchema2 = Modify<
  EndpointStateSchema1,
  { commandClasses: CommandClassState[] }
>;

type EndpointState =
  | EndpointStateSchema0
  | EndpointStateSchema1
  | EndpointStateSchema2;

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
  mandatorySupportedCCs: readonly CommandClasses[];
  mandatoryControlledCCs: readonly CommandClasses[];
}

interface ValueState extends TranslatedValueID {
  metadata: ValueMetadata;
  ccVersion: number;
  value?: any;
}

interface MetadataState {
  type: ValueType;
  default?: any;
  readable: boolean;
  writeable: boolean;
  description?: string;
  label?: string;
  ccSpecific?: Record<string, any>;
  valueChangeOptions?: readonly (keyof ValueChangeOptions)[];
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  steps?: number;
  states?: Record<number, string>;
  unit?: string;
}

interface ConfigurationMetadataState {
  type: ValueType;
  readable: boolean;
  writeable: boolean;
  description?: string;
  label?: string;
  ccSpecific?: Record<string, any>;
  valueChangeOptions?: readonly (keyof ValueChangeOptions)[];
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

interface NodeStateSchema0 extends EndpointStateSchema0 {
  status: NodeStatus;
  ready: boolean;
  isListening?: boolean;
  isFrequentListening: boolean | null;
  isRouting?: boolean;
  maxBaudRate?: DataRate;
  isSecure?: Maybe<boolean>;
  version: number | null;
  isBeaming?: boolean;
  manufacturerId?: number;
  productId?: number;
  productType?: number;
  firmwareVersion?: string;
  zwavePlusVersion?: number;
  nodeType?: ZWavePlusNodeType;
  roleType?: ZWavePlusRoleType;
  name?: string;
  location?: string;
  deviceConfig?: DeviceConfig;
  label?: string;
  endpointCountIsDynamic?: boolean;
  endpointsHaveIdenticalCapabilities?: boolean;
  individualEndpointCount?: number;
  aggregatedEndpointCount?: number;
  interviewAttempts: number;
  interviewStage: InterviewStage;

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
      isFrequentListening?: FLiRS;
      maxDataRate?: DataRate;
      supportedDataRates?: readonly DataRate[];
      protocolVersion?: ProtocolVersion;
      supportsBeaming?: boolean;
      supportsSecurity?: boolean;
      zwavePlusNodeType?: ZWavePlusNodeType;
      zwavePlusRoleType?: ZWavePlusRoleType;
      nodeType?: NodeType;
    }
  >,
  "maxBaudRate" | "version" | "isBeaming" | "roleType"
>;

type NodeStateSchema4 = Modify<NodeStateSchema3, { interviewStage?: string }>;

interface NodeStateSchema5 extends NodeStateSchema4 {
  deviceDatabaseUrl?: string;
}

type NodeStateSchema6 = NodeStateSchema5;

interface NodeStateSchema7 extends NodeStateSchema6 {
  statistics: NodeStatistics;
}

type NodeStateSchema8 = NodeStateSchema7;

type NodeStateSchema9 = NodeStateSchema8;

interface NodeStateSchema10 extends NodeStateSchema9 {
  highestSecurityClass: SecurityClass | undefined;
}

type NodeStateSchema11 = NodeStateSchema10;

type NodeStateSchema12 = NodeStateSchema11;

type NodeStateSchema13 = NodeStateSchema12;

interface NodeStateSchema14 extends NodeStateSchema13 {
  isControllerNode: boolean;
  keepAwake: boolean;
}

type NodeStateSchema15 = Omit<NodeStateSchema14, "commandClasses">;

export type NodeState =
  | NodeStateSchema0
  | NodeStateSchema1
  | NodeStateSchema2
  | NodeStateSchema3
  | NodeStateSchema4
  | NodeStateSchema5
  | NodeStateSchema6
  | NodeStateSchema7
  | NodeStateSchema8
  | NodeStateSchema9
  | NodeStateSchema10
  | NodeStateSchema11
  | NodeStateSchema12
  | NodeStateSchema13
  | NodeStateSchema14
  | NodeStateSchema15;

interface FoundNodeStateSchema19 {
  nodeId: number;
  deviceClass: DeviceClassState | null;
  status: NodeStatus;
}

type FoundNodeStateSchema22 = Omit<FoundNodeStateSchema19, "status">;

export type FoundNodeState = FoundNodeStateSchema19 | FoundNodeStateSchema22;

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
    valueChangeOptions: metadata.valueChangeOptions,
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
    valueChangeOptions: metadata.valueChangeOptions,
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
  if (schemaVersion <= 14) {
    node4.commandClasses = Array.from(node.getSupportedCCInstances(), (cc) =>
      dumpCommandClass(node, cc)
    );
  }
  node4.interviewStage = InterviewStage[node.interviewStage];
  if (schemaVersion == 4) {
    return node4;
  }

  const node5 = node4 as NodeStateSchema5;
  node5.deviceDatabaseUrl = node.deviceDatabaseUrl;
  if (schemaVersion <= 6) {
    return node5;
  }

  const node7 = node5 as NodeStateSchema7;
  node7.statistics = node.statistics;
  if (schemaVersion <= 9) {
    return node7;
  }

  const node10 = node7 as NodeStateSchema10;
  node10.highestSecurityClass = node.getHighestSecurityClass();
  if (schemaVersion <= 13) {
    return node10;
  }

  const node14 = node10 as NodeStateSchema14;
  node14.isControllerNode = node.isControllerNode;
  node14.keepAwake = node.keepAwake;
  if (schemaVersion == 14) {
    return node14;
  }

  return node14 as NodeStateSchema15;
};

export const dumpFoundNode = (
  foundNode: FoundNode,
  schemaVersion: number
): FoundNodeState => {
  const base: Partial<FoundNodeStateSchema19> = {
    nodeId: foundNode.id,
    deviceClass: foundNode.deviceClass
      ? dumpDeviceClass(foundNode.deviceClass)
      : null,
  };
  if (schemaVersion < 22) {
    base.status = NodeStatus.Unknown;
    return base as FoundNodeStateSchema19;
  }
  const node22 = base as FoundNodeStateSchema22;
  return node22;
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

  if (schemaVersion < 15) {
    return endpoint3;
  }
  const endpoint15 = base as EndpointStateSchema2;
  endpoint15.commandClasses = Array.from(
    endpoint.getSupportedCCInstances(),
    (cc) => dumpCommandClass(endpoint, cc)
  );
  return endpoint15;
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
  endpoint: Endpoint,
  commandClass: CommandClass
): CommandClassState => ({
  id: commandClass.ccId,
  name: CommandClasses[commandClass.ccId],
  version: commandClass.version,
  isSecure: endpoint.isCCSecure(commandClass.ccId),
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

export const dumpController = (
  driver: Driver,
  schemaVersion: number
): ControllerState => {
  const controller = driver.controller;
  const base: Partial<ControllerStateSchema0> = {
    type: controller.type,
    homeId: controller.homeId,
    ownNodeId: controller.ownNodeId,
    isUsingHomeIdFromOtherNetwork: controller.isUsingHomeIdFromOtherNetwork,
    isSISPresent: controller.isSISPresent,
    wasRealPrimary: controller.wasRealPrimary,
    manufacturerId: controller.manufacturerId,
    productType: controller.productType,
    productId: controller.productId,
    supportedFunctionTypes: controller.supportedFunctionTypes,
    sucNodeId: controller.sucNodeId,
    supportsTimers: controller.supportsTimers,
    isHealNetworkActive: controller.isHealNetworkActive,
    statistics: controller.statistics,
    inclusionState: controller.inclusionState,
  };

  if (schemaVersion < 22) {
    if (controller.isPrimary !== undefined) {
      base.isSecondary = !controller.isPrimary;
    }
    base.isStaticUpdateController = controller.isSUC;
    base.isSlave = controller.nodeType === NodeType["End Node"];
  }

  if (schemaVersion < 16) {
    const controller0 = base as ControllerStateSchema0;
    controller0.libraryVersion = controller.sdkVersion;
    controller0.serialApiVersion = controller.firmwareVersion;
    return controller0;
  }
  const controller16 = base as ControllerStateSchema16;
  controller16.sdkVersion = controller.sdkVersion;
  controller16.firmwareVersion = controller.firmwareVersion;
  if (schemaVersion < 22) {
    return controller16;
  }

  const controller22 = base as ControllerStateSchema22;
  controller22.isPrimary = controller.isPrimary;
  controller22.isSUC = controller.isSUC;
  controller22.nodeType = controller.nodeType;
  return controller22;
};

export const dumpState = (
  driver: Driver,
  schemaVersion: number
): ZwaveState => {
  const controller = driver.controller;
  return {
    driver: dumpDriver(driver, schemaVersion),
    controller: dumpController(driver, schemaVersion),
    nodes: Array.from(controller.nodes.values(), (node) =>
      dumpNode(node, schemaVersion)
    ),
  };
};

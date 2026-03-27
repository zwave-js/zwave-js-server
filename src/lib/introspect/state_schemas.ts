import type { RebuildRoutesStatus } from "zwave-js";
import type {
  LongRangeChannel,
  MaybeNotKnown,
  UnknownZWaveChipType,
  ZWaveApiVersion,
} from "@zwave-js/core";
import type {
  ControllerStateSchema0,
  ControllerStateSchema16,
  ControllerStateSchema22,
  ControllerStateSchema25,
  ControllerStateSchema31,
  ControllerStateSchema32,
  DriverStateSchema0,
  DriverStateSchema47,
  EndpointStateSchema0,
  EndpointStateSchema3,
  EndpointStateSchema15,
  EndpointStateSchema26,
  NodeStateSchema0,
  NodeStateSchema1,
  NodeStateSchema3,
  NodeStateSchema4,
  NodeStateSchema5,
  NodeStateSchema7,
  NodeStateSchema10,
  NodeStateSchema14,
  NodeStateSchema29,
  NodeStateSchema30,
  NodeStateSchema31,
  NodeStateSchema35,
  NodeStateSchema42,
  NodeStateSchema47,
} from "../state.js";

/**
 * JSON-serializable versions of ControllerStateSchema34+.
 *
 * The original types use `ReadonlyMap<number, RebuildRoutesStatus>` which
 * cannot be represented in JSON Schema. We replace it with
 * `Record<string, RebuildRoutesStatus>` to match the actual JSON wire format.
 */
type ControllerStateSchema34Json = ControllerStateSchema32 & {
  rebuildRoutesProgress?: Record<string, RebuildRoutesStatus>;
};

type ControllerStateSchema35Json = ControllerStateSchema34Json & {
  supportsLongRange: MaybeNotKnown<boolean>;
};

type ControllerStateSchema36Json = ControllerStateSchema35Json & {
  maxLongRangePowerlevel: MaybeNotKnown<number>;
  longRangeChannel: MaybeNotKnown<LongRangeChannel>;
  supportsLongRangeAutoChannelSelection: MaybeNotKnown<boolean>;
};

type ControllerStateSchema47Json = ControllerStateSchema36Json & {
  isSIS: MaybeNotKnown<boolean>;
  maxPayloadSize: MaybeNotKnown<number>;
  maxPayloadSizeLR: MaybeNotKnown<number>;
  zwaveApiVersion: MaybeNotKnown<ZWaveApiVersion>;
  zwaveChipType: MaybeNotKnown<string | UnknownZWaveChipType>;
};

export interface StateSchemas {
  driver: {
    0: DriverStateSchema0;
    47: DriverStateSchema47;
  };
  controller: {
    0: ControllerStateSchema0;
    16: ControllerStateSchema16;
    22: ControllerStateSchema22;
    25: ControllerStateSchema25;
    31: ControllerStateSchema31;
    32: ControllerStateSchema32;
    34: ControllerStateSchema34Json;
    35: ControllerStateSchema35Json;
    36: ControllerStateSchema36Json;
    47: ControllerStateSchema47Json;
  };
  endpoint: {
    0: EndpointStateSchema0;
    3: EndpointStateSchema3;
    15: EndpointStateSchema15;
    26: EndpointStateSchema26;
  };
  node: {
    0: NodeStateSchema0;
    1: NodeStateSchema1;
    3: NodeStateSchema3;
    4: NodeStateSchema4;
    5: NodeStateSchema5;
    7: NodeStateSchema7;
    10: NodeStateSchema10;
    14: NodeStateSchema14;
    29: NodeStateSchema29;
    30: NodeStateSchema30;
    31: NodeStateSchema31;
    35: NodeStateSchema35;
    42: NodeStateSchema42;
    47: NodeStateSchema47;
  };
}

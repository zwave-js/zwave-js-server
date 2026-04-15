import {
  OTWFirmwareUpdateResult,
  Endpoint,
  FirmwareUpdateResult,
  ConfigValue,
  SetValueResult,
  SetValueStatus,
  ZWaveNode,
} from "zwave-js";
import type { GetFirmwareUpdatesOptions } from "zwave-js/Controller";
import type { Client } from "./server.js";
import type { ConfigurationCCAPISetOptions } from "@zwave-js/cc";
import {
  extractFirmware,
  Firmware,
  FirmwareFileFormat,
  guessFirmwareFileFormat,
  MaybeNotKnown,
  RFRegion,
  SupervisionResult,
  tryUnzipFirmwareFile,
} from "@zwave-js/core";
import {
  IncomingCommandNodeGetRawConfigParameterValue,
  IncomingCommandNodeSetRawConfigParameterValue,
} from "./node/incoming_message.js";
import {
  IncomingCommandEndpointGetRawConfigParameterValue,
  IncomingCommandEndpointSetRawConfigParameterValue,
} from "./endpoint/incoming_message.js";
import { InvalidParamsPassedToCommandError } from "./error.js";

export interface BufferObject {
  type: "Buffer";
  data: number[];
}

export function isBufferObject(
  obj: unknown,
): obj is { type: "Buffer"; data: number[] } {
  return (
    obj instanceof Object &&
    Object.keys(obj).length === 2 &&
    "type" in obj &&
    obj.type === "Buffer" &&
    "data" in obj &&
    Array.isArray(obj.data) &&
    obj.data.every((item) => typeof item === "number")
  );
}

export function deserializeBufferInArray(array: unknown[]): unknown[] {
  // Iterate over all items in array and deserialize any Buffer objects
  for (let idx = 0; idx < array.length; idx++) {
    const value = array[idx];
    if (isBufferObject(value)) {
      array[idx] = Buffer.from(value.data);
    }
  }
  return array;
}

export function deserializeBuffer(
  value: string | BufferObject,
): string | Uint8Array {
  if (isBufferObject(value)) {
    return Buffer.from(value.data);
  }
  return value;
}

export type SetValueResultType =
  | { result: SetValueResult } // schemaVersion >= 29
  | { success: boolean }; // schemaVersion < 29

export function setValueOutgoingMessage(
  result: SetValueResult,
  schemaVersion: number,
): SetValueResultType {
  if (schemaVersion < 29) {
    return {
      success: [
        SetValueStatus.Working,
        SetValueStatus.Success,
        SetValueStatus.SuccessUnsupervised,
      ].includes(result.status),
    };
  }
  return { result };
}

export type FirmwareUpdateResultType =
  | { result: OTWFirmwareUpdateResult | FirmwareUpdateResult } // schemaVersion >= 29
  | { success: boolean }; // schemaVersion < 29

// Schema version >= 41, driver command only
export type OTWFirmwareUpdateResultType = { result: OTWFirmwareUpdateResult };

export function firmwareUpdateOutgoingMessage<
  T extends OTWFirmwareUpdateResult | FirmwareUpdateResult,
>(result: T, schemaVersion: number): { result: T } | { success: boolean } {
  if (schemaVersion < 29) {
    return {
      success: result.success,
    };
  }
  return { result };
}

export async function setRawConfigParameterValue(
  message:
    | IncomingCommandNodeSetRawConfigParameterValue
    | IncomingCommandEndpointSetRawConfigParameterValue,
  nodeOrEndpoint: ZWaveNode | Endpoint,
): Promise<{ result?: SupervisionResult }> {
  if (
    (message.valueSize !== undefined && message.valueFormat === undefined) ||
    (message.valueSize === undefined && message.valueFormat !== undefined)
  ) {
    throw new InvalidParamsPassedToCommandError(
      "valueFormat and valueSize must be used in combination or not at all",
    );
  }
  if (message.valueSize !== undefined && message.bitMask !== undefined) {
    throw new InvalidParamsPassedToCommandError(
      "bitMask cannot be used in combination with valueFormat and valueSize",
    );
  }
  let options: ConfigurationCCAPISetOptions;
  if (message.bitMask !== undefined) {
    options = {
      parameter: message.parameter,
      bitMask: message.bitMask,
      value: message.value,
    };
  } else {
    options = {
      parameter: message.parameter,
      valueFormat: message.valueFormat,
      valueSize: message.valueSize,
      value: message.value,
    };
  }
  const result = await nodeOrEndpoint.commandClasses.Configuration.set(options);
  return { result };
}

export async function getRawConfigParameterValue(
  message:
    | IncomingCommandNodeGetRawConfigParameterValue
    | IncomingCommandEndpointGetRawConfigParameterValue,
  nodeOrEndpoint: ZWaveNode | Endpoint,
): Promise<{ value: MaybeNotKnown<ConfigValue> }> {
  const value = await nodeOrEndpoint.commandClasses.Configuration.get(
    message.parameter,
    {
      valueBitMask: message.bitMask,
    },
  );
  return { value };
}

// Precedence:
// 1. Always try ZIP extraction first — firmware files may be zipped
//    regardless of filename extension or explicit format.
// 2. If an explicit format is provided, use it (on the unzipped data if
//    applicable, otherwise on the raw data as-is).
// 3. Fall back to guessing the format from the filename and raw data.
function parseFirmwareFile(
  filename: string,
  rawData: Uint8Array<ArrayBuffer>,
  explicitFormat?: FirmwareFileFormat,
): { rawData: Uint8Array<ArrayBuffer>; format: FirmwareFileFormat } {
  const unzipped = tryUnzipFirmwareFile(rawData);
  if (unzipped) {
    return explicitFormat !== undefined
      ? { rawData: unzipped.rawData, format: explicitFormat }
      : unzipped;
  }

  if (explicitFormat !== undefined) {
    return { rawData, format: explicitFormat };
  }

  return { rawData, format: guessFirmwareFileFormat(filename, rawData) };
}

/**
 * Parses a firmware file (handling format detection and ZIP extraction)
 * and extracts the firmware data.
 */
export async function parseAndExtractFirmware(
  filename: string,
  rawData: Uint8Array<ArrayBuffer>,
  explicitFormat?: FirmwareFileFormat,
): Promise<Firmware> {
  const parsed = parseFirmwareFile(filename, rawData, explicitFormat);
  return extractFirmware(parsed.rawData, parsed.format);
}

export function getFirmwareUpdateOptions(
  message: {
    apiKey?: string;
    includePrereleases?: boolean;
    rfRegion?: RFRegion;
  },
  client: Client,
): GetFirmwareUpdatesOptions {
  return {
    apiKey: message.apiKey,
    additionalUserAgentComponents: client.additionalUserAgentComponents,
    includePrereleases: message.includePrereleases,
    rfRegion: message.rfRegion,
  };
}

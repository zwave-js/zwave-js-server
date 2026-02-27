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

export interface FirmwareFileInfo {
  filename: string;
  rawData: Uint8Array<ArrayBuffer>;
  format: FirmwareFileFormat;
}

/**
 * Tries to determine the firmware file format, with automatic ZIP extraction fallback.
 * First attempts guessFirmwareFileFormat. If that fails, tries to extract from ZIP archive.
 */
export function parseFirmwareFile(
  filename: string,
  rawData: Uint8Array<ArrayBuffer>,
  explicitFormat?: FirmwareFileFormat,
): FirmwareFileInfo {
  // If format is explicitly provided, use it directly
  if (explicitFormat !== undefined) {
    return { filename, rawData, format: explicitFormat };
  }

  try {
    // First, try to guess the format directly
    const format = guessFirmwareFileFormat(filename, rawData);
    return { filename, rawData, format };
  } catch (guessError) {
    // If guessing failed, try to extract from ZIP
    const unzipped = tryUnzipFirmwareFile(rawData);
    if (unzipped) {
      return {
        filename: unzipped.filename,
        rawData: unzipped.rawData,
        format: unzipped.format,
      };
    }
    // If unzip also failed, re-throw the original error
    throw guessError;
  }
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

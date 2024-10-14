import {
  ControllerFirmwareUpdateResult,
  Endpoint,
  FirmwareUpdateResult,
  ConfigValue,
  SetValueResult,
  SetValueStatus,
  ZWaveNode,
} from "zwave-js";
import type { ConfigurationCCAPISetOptions } from "@zwave-js/cc";
import { SupervisionResult, MaybeNotKnown } from "@zwave-js/core";
import {
  IncomingCommandNodeGetRawConfigParameterValue,
  IncomingCommandNodeSetRawConfigParameterValue,
} from "./node/incoming_message";
import {
  IncomingCommandEndpointGetRawConfigParameterValue,
  IncomingCommandEndpointSetRawConfigParameterValue,
} from "./endpoint/incoming_message";
import { InvalidParamsPassedToCommandError } from "./error";

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
  | { result: ControllerFirmwareUpdateResult | FirmwareUpdateResult } // schemaVersion >= 29
  | { success: boolean }; // schemaVersion < 29

export function firmwareUpdateOutgoingMessage<
  T extends ControllerFirmwareUpdateResult | FirmwareUpdateResult,
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
      allowUnexpectedResponse: message.allowUnexpectedResponse,
    },
  );
  return { value };
}

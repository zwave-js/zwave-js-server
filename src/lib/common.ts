import {
  ControllerFirmwareUpdateResult,
  FirmwareUpdateResult,
  SetValueResult,
  SetValueStatus,
} from "zwave-js";

export function setValueOutgoingMessage(
  result: SetValueResult,
  schemaVersion: number
): { result: SetValueResult } | { success: boolean } {
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

export function firmwareUpdateOutgoingMessage<
  T extends FirmwareUpdateResult | ControllerFirmwareUpdateResult
>(result: T, schemaVersion: number): { result: T } | { success: boolean } {
  if (schemaVersion < 29) {
    return {
      success: result.success,
    };
  }
  return { result };
}

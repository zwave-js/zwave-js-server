export enum ErrorCode {
  unknownError = "unknown_error",
  unknownCommand = "unknown_command",
  nodeNotFound = "node_not_found",
  endpointNotFound = "endpoint_not_found",
  virtualEndpointNotFound = "virtual_endpoint_not_found",
  schemaIncompatible = "schema_incompatible",
  zwaveError = "zwave_error",
  inclusionPhaseNotInProgress = "inclusion_phase_not_in_progress",
  inclusionAlreadyInProgress = "inclusion_already_in_progress",
  invalidParamsPassedToCommand = "invalid_params_passed_to_command",
  noLongerSupported = "no_longer_supported",
}

export class BaseError extends Error {
  // @ts-ignore
  errorCode: ErrorCode;

  constructor(message?: string) {
    super(message);
    // We need to set the prototype explicitly
    Object.setPrototypeOf(this, BaseError.prototype);
    Object.getPrototypeOf(this).name = "BaseError";
  }
}

export class UnknownError extends BaseError {
  errorCode = ErrorCode.unknownError;

  constructor(public error: Error) {
    super();
    // We need to set the prototype explicitly
    Object.setPrototypeOf(this, UnknownError.prototype);
    Object.getPrototypeOf(this).name = "UnknownError";
  }
}

export class UnknownCommandError extends BaseError {
  errorCode = ErrorCode.unknownCommand;

  constructor(public command: string) {
    super();
    // We need to set the prototype explicitly
    Object.setPrototypeOf(this, UnknownCommandError.prototype);
    Object.getPrototypeOf(this).name = "UnknownCommandError";
  }
}

export class NodeNotFoundError extends BaseError {
  errorCode = ErrorCode.nodeNotFound;

  constructor(public nodeId: number) {
    super();
    // We need to set the prototype explicitly
    Object.setPrototypeOf(this, NodeNotFoundError.prototype);
    Object.getPrototypeOf(this).name = "NodeNotFoundError";
  }
}

export class SchemaIncompatibleError extends BaseError {
  errorCode = ErrorCode.schemaIncompatible;

  constructor(public schemaId: number) {
    super();
    // We need to set the prototype explicitly
    Object.setPrototypeOf(this, SchemaIncompatibleError.prototype);
    Object.getPrototypeOf(this).name = "SchemaIncompatibleError";
  }
}

export class VirtualEndpointNotFoundError extends BaseError {
  errorCode = ErrorCode.virtualEndpointNotFound;

  constructor(
    public index: number,
    public nodeIDs?: number[],
    public broadcast?: boolean,
  ) {
    super();
    // We need to set the prototype explicitly
    Object.setPrototypeOf(this, VirtualEndpointNotFoundError.prototype);
    Object.getPrototypeOf(this).name = "VirtualEndpointNotFoundError";
  }
}

export class EndpointNotFoundError extends BaseError {
  errorCode = ErrorCode.endpointNotFound;

  constructor(
    public nodeId: number,
    public index: number,
  ) {
    super();
    // We need to set the prototype explicitly
    Object.setPrototypeOf(this, EndpointNotFoundError.prototype);
    Object.getPrototypeOf(this).name = "EndpointNotFoundError";
  }
}

export class InclusionPhaseNotInProgressError extends BaseError {
  errorCode = ErrorCode.inclusionPhaseNotInProgress;

  constructor(public phase: string) {
    super();
    // We need to set the prototype explicitly
    Object.setPrototypeOf(this, InclusionPhaseNotInProgressError.prototype);
    Object.getPrototypeOf(this).name = "InclusionPhaseNotInProgressError";
  }
}

export class InclusionAlreadyInProgressError extends BaseError {
  errorCode = ErrorCode.inclusionAlreadyInProgress;

  constructor() {
    super();
    // We need to set the prototype explicitly
    Object.setPrototypeOf(this, InclusionAlreadyInProgressError.prototype);
    Object.getPrototypeOf(this).name = "InclusionAlreadyInProgressError";
  }
}

export class InvalidParamsPassedToCommandError extends BaseError {
  errorCode = ErrorCode.invalidParamsPassedToCommand;

  constructor(message: string) {
    super(message);
    // We need to set the prototype explicitly
    Object.setPrototypeOf(this, InvalidParamsPassedToCommandError.prototype);
    Object.getPrototypeOf(this).name = "InvalidParamsPassedToCommandError";
  }
}

export class NoLongerSupportedError extends BaseError {
  errorCode = ErrorCode.noLongerSupported;

  constructor(message: string) {
    super(
      message +
        " If you are using an application that integrates with Z-Wave JS and you receive this error, you may need to update the application.",
    );
    // We need to set the prototype explicitly
    Object.setPrototypeOf(this, NoLongerSupportedError.prototype);
    Object.getPrototypeOf(this).name = "NoLongerSupportedError";
  }
}

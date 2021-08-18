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
}

export class BaseError extends Error {
  // @ts-ignore
  errorCode: ErrorCode;
}

export class UnknownError extends BaseError {
  errorCode = ErrorCode.unknownError;

  constructor(public error: Error) {
    super();
  }
}

export class UnknownCommandError extends BaseError {
  errorCode = ErrorCode.unknownCommand;

  constructor(public command: string) {
    super();
  }
}

export class NodeNotFoundError extends BaseError {
  errorCode = ErrorCode.nodeNotFound;

  constructor(public nodeId: number) {
    super();
  }
}

export class SchemaIncompatibleError extends BaseError {
  errorCode = ErrorCode.schemaIncompatible;

  constructor(public schemaId: number) {
    super();
  }
}

export class VirtualEndpointNotFoundError extends BaseError {
  errorCode = ErrorCode.virtualEndpointNotFound;

  constructor(
    public index: number,
    public nodeIDs?: number[],
    public broadcast?: boolean
  ) {
    super();
  }
}

export class EndpointNotFoundError extends BaseError {
  errorCode = ErrorCode.endpointNotFound;

  constructor(public nodeId: number, public index: number) {
    super();
  }
}

export class InclusionPhaseNotInProgressError extends BaseError {
  errorCode = ErrorCode.inclusionPhaseNotInProgress;

  constructor(public phase: string) {
    super();
  }
}

export class InclusionAlreadyInProgressError extends BaseError {
  errorCode = ErrorCode.inclusionAlreadyInProgress;
}

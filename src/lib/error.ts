export enum ErrorCode {
  unknownError = "unknown_error",
  unknownCommand = "unknown_command",
  nodeNotFound = "node_not_found",
  schemaIncompatible = "schema_incompatible",
  notSupportedBySchema = "not_supported_by_schema",
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

export class NotSupportedBySchemaError extends BaseError {
  errorCode = ErrorCode.schemaIncompatible;

  constructor(public schemaUsedId: number, public schemaRequired: string) {
    super();
  }
}

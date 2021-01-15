export enum ErrorCode {
  unknownError = "unknown_error",
  unknownCommand = "unknown_command",
  nodeNotFound = "node_not_found",
}

export class BaseError extends Error {
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

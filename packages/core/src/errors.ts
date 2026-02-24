export class EngineError extends Error {
  public readonly code: string;
  constructor(code: string, message: string) {
    super(message);
    this.name = "EngineError";
    this.code = code;
  }
}

export class OperationNotFoundError extends EngineError {
  constructor(opId: string) {
    super("OP_NOT_FOUND", `Operation not found: ${opId}`);
    this.name = "OperationNotFoundError";
  }
}

export class ConversionError extends EngineError {
  constructor(fromType: string, toType: string) {
    super("CONVERSION_ERROR", `Cannot convert from ${fromType} to ${toType}`);
    this.name = "ConversionError";
  }
}

export class OperationRuntimeError extends EngineError {
  public readonly opId: string;
  constructor(opId: string, message: string) {
    super("OP_RUNTIME_ERROR", message);
    this.name = "OperationRuntimeError";
    this.opId = opId;
  }
}

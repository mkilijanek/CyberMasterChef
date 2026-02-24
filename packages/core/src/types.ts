export type ValueType = "string" | "bytes" | "json" | "number";

export type DataValue =
  | { type: "string"; value: string }
  | { type: "bytes"; value: Uint8Array }
  | { type: "json"; value: unknown }
  | { type: "number"; value: number };

export type ArgType = "string" | "boolean" | "number" | "select";

export interface ArgOption {
  label: string;
  value: string;
}

export interface ArgSpec {
  key: string;
  label: string;
  type: ArgType;
  description?: string;
  defaultValue?: unknown;
  options?: ArgOption[];
}

export interface Operation {
  id: string;
  name: string;
  description: string;
  input: ValueType[];
  output: ValueType;
  args: ArgSpec[];
  run(ctx: OperationContext): Promise<DataValue> | DataValue;
}

export interface OperationContext {
  input: DataValue;
  args: Record<string, unknown>;
  signal?: AbortSignal;
}

export interface Plugin {
  pluginId: string;
  version: string;
  register(registry: OperationRegistry): void;
}

export interface OperationRegistry {
  register(op: Operation): void;
  get(id: string): Operation | undefined;
  list(): Operation[];
}

export type RecipeStep = {
  opId: string;
  args?: Record<string, unknown>;
};

export type Recipe = {
  version: 1;
  steps: RecipeStep[];
};

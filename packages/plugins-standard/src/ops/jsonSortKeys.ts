import { OperationJsonParseError, type DataValue, type Operation } from "@cybermasterchef/core";

function parseJson(opId: string, value: string): unknown {
  try {
    return JSON.parse(value) as unknown;
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    throw new OperationJsonParseError(opId, "Invalid JSON input", reason);
  }
}

function sortJsonValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => sortJsonValue(item));
  }
  if (value !== null && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>).sort(([a], [b]) =>
      a.localeCompare(b)
    );
    const sorted: Record<string, unknown> = {};
    for (const [key, nested] of entries) sorted[key] = sortJsonValue(nested);
    return sorted;
  }
  return value;
}

export const jsonSortKeys: Operation = {
  id: "format.jsonSortKeys",
  name: "JSON Sort Keys",
  description: "Parses JSON input and emits canonical JSON with recursively sorted object keys.",
  input: ["string", "json"],
  output: "string",
  args: [],
  run: ({ input }) => {
    let parsed: unknown;
    if (input.type === "string") {
      parsed = parseJson("format.jsonSortKeys", input.value);
    } else if (input.type === "json") {
      parsed = input.value;
    } else {
      throw new Error("Expected string or json input");
    }
    const sorted = sortJsonValue(parsed);
    const output: DataValue = { type: "string", value: JSON.stringify(sorted) };
    return output;
  }
};

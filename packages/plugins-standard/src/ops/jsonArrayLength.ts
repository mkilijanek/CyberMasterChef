import { OperationJsonParseError, type Operation } from "@cybermasterchef/core";

function parseJson(opId: string, value: string): unknown {
  try {
    return JSON.parse(value) as unknown;
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    throw new OperationJsonParseError(opId, "Invalid JSON input", reason);
  }
}

function getByPath(root: unknown, path: string): unknown {
  if (path.trim().length === 0) return root;
  const segments = path.split(".").filter((s) => s.length > 0);
  let current: unknown = root;
  for (const segment of segments) {
    if (current === null || typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[segment];
  }
  return current;
}

export const jsonArrayLength: Operation = {
  id: "format.jsonArrayLength",
  name: "JSON Array Length",
  description: "Returns length of root or nested JSON array.",
  input: ["string", "json"],
  output: "string",
  args: [
    {
      key: "path",
      label: "Path",
      type: "string",
      defaultValue: ""
    }
  ],
  run: ({ input, args }) => {
    let parsed: unknown;
    if (input.type === "string") {
      parsed = parseJson("format.jsonArrayLength", input.value);
    } else if (input.type === "json") {
      parsed = input.value;
    } else {
      throw new Error("Expected string or json input");
    }
    const path = typeof args.path === "string" ? args.path : "";
    const target = getByPath(parsed, path);
    if (!Array.isArray(target)) throw new Error("Target is not an array");
    return { type: "string", value: String(target.length) };
  }
};

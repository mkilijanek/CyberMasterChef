import { OperationJsonParseError, type Operation } from "@cybermasterchef/core";

function parseJson(opId: string, value: string): unknown {
  try {
    return JSON.parse(value) as unknown;
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    throw new OperationJsonParseError(opId, "Invalid JSON input", reason);
  }
}

export const jsonMinify: Operation = {
  id: "format.jsonMinify",
  name: "JSON Minify",
  description: "Minifies valid JSON string payload.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    const parsed = parseJson("format.jsonMinify", input.value);
    return { type: "string", value: JSON.stringify(parsed) };
  }
};

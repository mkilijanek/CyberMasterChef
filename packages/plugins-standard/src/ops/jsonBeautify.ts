import { OperationJsonParseError, type Operation } from "@cybermasterchef/core";

function parseJson(opId: string, value: string): unknown {
  try {
    return JSON.parse(value) as unknown;
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    throw new OperationJsonParseError(opId, "Invalid JSON input", reason);
  }
}

export const jsonBeautify: Operation = {
  id: "format.jsonBeautify",
  name: "JSON Beautify",
  description: "Pretty-prints valid JSON string payload.",
  input: ["string"],
  output: "string",
  args: [
    {
      key: "indent",
      label: "Indent",
      type: "number",
      defaultValue: 2
    }
  ],
  run: ({ input, args }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    const indentArg = typeof args.indent === "number" ? args.indent : 2;
    const indent = Math.max(0, Math.min(8, Math.floor(indentArg)));
    const parsed = parseJson("format.jsonBeautify", input.value);
    return { type: "string", value: JSON.stringify(parsed, null, indent) };
  }
};

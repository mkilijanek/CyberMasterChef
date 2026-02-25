import { OperationJsonParseError, type Operation } from "@cybermasterchef/core";
import jsonata from "jsonata";

function parseJson(opId: string, value: string): unknown {
  try {
    return JSON.parse(value) as unknown;
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    throw new OperationJsonParseError(opId, "Invalid JSON input", reason);
  }
}

export const jsonataQuery: Operation = {
  id: "format.jsonataQuery",
  name: "Jsonata Query",
  description: "Executes a Jsonata expression against JSON input.",
  input: ["string", "json"],
  output: "json",
  args: [
    {
      key: "expression",
      label: "Expression",
      type: "string",
      defaultValue: ""
    }
  ],
  run: async ({ input, args }) => {
    const expression = typeof args.expression === "string" ? args.expression : "";
    if (!expression) throw new Error("Expression argument is required");

    let payload: unknown;
    if (input.type === "string") {
      payload = parseJson("format.jsonataQuery", input.value);
    } else if (input.type === "json") {
      payload = input.value;
    } else {
      throw new Error("Expected string or json input");
    }

    try {
      const expr = jsonata(expression);
      const result = expr.evaluate(payload);
      const resolved = result instanceof Promise ? await result : result;
      return { type: "json", value: resolved };
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      throw new Error(`Jsonata evaluation failed: ${reason}`, { cause: error });
    }
  }
};

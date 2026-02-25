import { OperationJsonParseError, type Operation } from "@cybermasterchef/core";
import yaml from "yaml";

function parseJson(opId: string, value: string): unknown {
  try {
    return JSON.parse(value) as unknown;
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    throw new OperationJsonParseError(opId, "Invalid JSON input", reason);
  }
}

export const jsonToYaml: Operation = {
  id: "format.jsonToYaml",
  name: "JSON To YAML",
  description: "Serializes JSON into YAML.",
  input: ["string", "json"],
  output: "string",
  args: [],
  run: ({ input }) => {
    let data: unknown;
    if (input.type === "string") {
      data = parseJson("format.jsonToYaml", input.value);
    } else if (input.type === "json") {
      data = input.value;
    } else {
      throw new Error("Expected string or json input");
    }

    return { type: "string", value: yaml.stringify(data) };
  }
};

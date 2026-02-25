import type { Operation } from "@cybermasterchef/core";
import yaml from "yaml";

export const yamlToJson: Operation = {
  id: "format.yamlToJson",
  name: "YAML To JSON",
  description: "Parses YAML input into JSON.",
  input: ["string"],
  output: "json",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    try {
      const parsed = yaml.parse(input.value) as unknown;
      return { type: "json", value: parsed };
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      throw new Error(`Invalid YAML input: ${reason}`, { cause: error });
    }
  }
};

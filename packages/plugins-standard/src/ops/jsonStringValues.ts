import type { Operation } from "@cybermasterchef/core";

function collectStrings(value: unknown, out: string[]): void {
  if (typeof value === "string") {
    out.push(value);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item) => collectStrings(item, out));
    return;
  }
  if (value !== null && typeof value === "object") {
    for (const nested of Object.values(value as Record<string, unknown>)) {
      collectStrings(nested, out);
    }
  }
}

export const jsonStringValues: Operation = {
  id: "format.jsonStringValues",
  name: "JSON String Values",
  description: "Extracts all string leaf values from JSON payload.",
  input: ["string", "json"],
  output: "string",
  args: [],
  run: ({ input }) => {
    let parsed: unknown;
    if (input.type === "string") {
      try {
        parsed = JSON.parse(input.value) as unknown;
      } catch {
        throw new Error("Invalid JSON input");
      }
    } else if (input.type === "json") {
      parsed = input.value;
    } else {
      throw new Error("Expected string or json input");
    }

    const values: string[] = [];
    collectStrings(parsed, values);
    return { type: "string", value: values.join("\n") };
  }
};

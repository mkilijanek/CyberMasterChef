import type { Operation } from "@cybermasterchef/core";

function collectNumbers(value: unknown, out: number[]): void {
  if (typeof value === "number" && Number.isFinite(value)) {
    out.push(value);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item) => collectNumbers(item, out));
    return;
  }
  if (value !== null && typeof value === "object") {
    for (const nested of Object.values(value as Record<string, unknown>)) {
      collectNumbers(nested, out);
    }
  }
}

export const jsonNumberValues: Operation = {
  id: "format.jsonNumberValues",
  name: "JSON Number Values",
  description: "Extracts all numeric leaf values from JSON payload.",
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

    const values: number[] = [];
    collectNumbers(parsed, values);
    return { type: "string", value: values.map((v) => String(v)).join("\n") };
  }
};

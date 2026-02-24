import type { Operation } from "@cybermasterchef/core";

const ISO_REGEX =
  /\b\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z\b/g;

export const extractIsoTimestamps: Operation = {
  id: "date.extractIsoTimestamps",
  name: "Extract ISO Timestamps",
  description: "Extracts unique ISO-8601 UTC timestamp strings from text input.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    const matches = input.value.match(ISO_REGEX) ?? [];
    const unique = new Set<string>();
    for (const match of matches) {
      const ms = Date.parse(match);
      if (Number.isFinite(ms)) unique.add(new Date(ms).toISOString());
    }
    return { type: "string", value: Array.from(unique).join("\n") };
  }
};

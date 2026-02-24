import type { Operation } from "@cybermasterchef/core";

export const isoToUnix: Operation = {
  id: "date.isoToUnix",
  name: "ISO to Unix",
  description: "Converts ISO-8601 timestamp to Unix epoch milliseconds.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    const value = input.value.trim();
    if (value.length === 0) throw new Error("Expected non-empty ISO timestamp");
    const ms = Date.parse(value);
    if (!Number.isFinite(ms)) throw new Error("Invalid ISO timestamp");
    return { type: "string", value: String(ms) };
  }
};

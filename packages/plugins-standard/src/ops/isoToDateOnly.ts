import type { Operation } from "@cybermasterchef/core";

export const isoToDateOnly: Operation = {
  id: "date.isoToDateOnly",
  name: "ISO to Date Only",
  description: "Converts ISO-8601 timestamp to date-only format (YYYY-MM-DD).",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    const raw = input.value.trim();
    if (raw.length === 0) throw new Error("Expected non-empty ISO timestamp");
    const ms = Date.parse(raw);
    if (!Number.isFinite(ms)) throw new Error("Invalid ISO timestamp");
    return { type: "string", value: new Date(ms).toISOString().slice(0, 10) };
  }
};

import type { Operation } from "@cybermasterchef/core";

const OBJECT_ID_HEX = /^[0-9a-f]{24}$/i;

export const parseObjectIdTimestamp: Operation = {
  id: "date.parseObjectIdTimestamp",
  name: "Parse ObjectId Timestamp",
  description: "Extracts MongoDB ObjectId timestamp and renders it as ISO-8601 UTC.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    const value = input.value.trim();
    if (!OBJECT_ID_HEX.test(value)) throw new Error("Expected 24-char hex ObjectId");
    const epochSeconds = Number.parseInt(value.slice(0, 8), 16);
    const date = new Date(epochSeconds * 1000);
    return { type: "string", value: date.toISOString() };
  }
};

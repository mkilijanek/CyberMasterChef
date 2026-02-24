import type { Operation } from "@cybermasterchef/core";

export const normalizeCommas: Operation = {
  id: "text.normalizeCommas",
  name: "Normalize Commas",
  description: "Collapses multiple commas into one.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    return { type: "string", value: input.value.replace(/,+/gu, ",") };
  }
};

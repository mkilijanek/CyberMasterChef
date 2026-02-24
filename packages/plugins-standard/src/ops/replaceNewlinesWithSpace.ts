import type { Operation } from "@cybermasterchef/core";

export const replaceNewlinesWithSpace: Operation = {
  id: "text.replaceNewlinesWithSpace",
  name: "Newlines To Space",
  description: "Replaces line breaks with spaces.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    return { type: "string", value: input.value.replace(/\r?\n/gu, " ") };
  }
};

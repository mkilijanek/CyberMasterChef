import type { Operation } from "@cybermasterchef/core";

export const removeSemicolons: Operation = {
  id: "text.removeSemicolons",
  name: "Remove Semicolons",
  description: "Removes semicolons.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    return { type: "string", value: input.value.replace(/;+/gu, "") };
  }
};

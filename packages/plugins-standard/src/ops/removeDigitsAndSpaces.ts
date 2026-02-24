import type { Operation } from "@cybermasterchef/core";

export const removeDigitsAndSpaces: Operation = {
  id: "text.removeDigitsAndSpaces",
  name: "Remove Digits And Spaces",
  description: "Removes digits and whitespace.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    return { type: "string", value: input.value.replace(/[0-9\s]+/gu, "") };
  }
};

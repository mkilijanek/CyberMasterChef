import type { Operation } from "@cybermasterchef/core";

export const removeDigits: Operation = {
  id: "text.removeDigits",
  name: "Remove Digits",
  description: "Removes all digits.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    return { type: "string", value: input.value.replace(/[0-9]+/gu, "") };
  }
};

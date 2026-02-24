import type { Operation } from "@cybermasterchef/core";

export const keepDigitsAndDots: Operation = {
  id: "text.keepDigitsAndDots",
  name: "Keep Digits And Dots",
  description: "Keeps digits and dots only.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    return { type: "string", value: input.value.replace(/[^0-9.]+/gu, "") };
  }
};

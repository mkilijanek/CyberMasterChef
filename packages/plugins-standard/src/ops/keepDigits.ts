import type { Operation } from "@cybermasterchef/core";

export const keepDigits: Operation = {
  id: "text.keepDigits",
  name: "Keep Digits",
  description: "Keeps digits only.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    return { type: "string", value: input.value.replace(/[^0-9]+/gu, "") };
  }
};

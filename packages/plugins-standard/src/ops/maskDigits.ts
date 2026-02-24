import type { Operation } from "@cybermasterchef/core";

export const maskDigits: Operation = {
  id: "text.maskDigits",
  name: "Mask Digits",
  description: "Masks all digits with asterisks.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    return { type: "string", value: input.value.replace(/[0-9]/gu, "*") };
  }
};

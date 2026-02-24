import type { Operation } from "@cybermasterchef/core";

export const keepLetters: Operation = {
  id: "text.keepLetters",
  name: "Keep Letters",
  description: "Keeps ASCII letters only.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    return { type: "string", value: input.value.replace(/[^A-Za-z]+/gu, "") };
  }
};

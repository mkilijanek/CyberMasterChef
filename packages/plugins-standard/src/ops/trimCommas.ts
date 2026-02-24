import type { Operation } from "@cybermasterchef/core";

export const trimCommas: Operation = {
  id: "text.trimCommas",
  name: "Trim Commas",
  description: "Trims commas from both ends.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    return { type: "string", value: input.value.replace(/^,+|,+$/gu, "") };
  }
};

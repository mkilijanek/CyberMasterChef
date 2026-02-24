import type { Operation } from "@cybermasterchef/core";

export const removeCommas: Operation = {
  id: "text.removeCommas",
  name: "Remove Commas",
  description: "Removes commas.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    return { type: "string", value: input.value.replace(/,+/gu, "") };
  }
};

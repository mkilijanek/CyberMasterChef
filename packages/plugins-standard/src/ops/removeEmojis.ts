import type { Operation } from "@cybermasterchef/core";

export const removeEmojis: Operation = {
  id: "text.removeEmojis",
  name: "Remove Emojis",
  description: "Removes Unicode emoji presentation characters.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    return { type: "string", value: input.value.replace(/\p{Extended_Pictographic}+/gu, "") };
  }
};

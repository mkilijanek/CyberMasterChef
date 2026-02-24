import type { Operation } from "@cybermasterchef/core";

export const removeHashes: Operation = {
  id: "text.removeHashes",
  name: "Remove Hashes",
  description: "Removes hash characters.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    return { type: "string", value: input.value.replace(/#+/gu, "") };
  }
};

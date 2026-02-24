import type { Operation } from "@cybermasterchef/core";

export const removeAmpersands: Operation = {
  id: "text.removeAmpersands",
  name: "Remove Ampersands",
  description: "Removes ampersands.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    return { type: "string", value: input.value.replace(/&+/gu, "") };
  }
};

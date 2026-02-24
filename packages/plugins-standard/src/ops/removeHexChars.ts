import type { Operation } from "@cybermasterchef/core";

export const removeHexChars: Operation = {
  id: "text.removeHexChars",
  name: "Remove Hex Chars",
  description: "Removes hexadecimal characters.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    return { type: "string", value: input.value.replace(/[0-9a-fA-F]+/gu, "") };
  }
};

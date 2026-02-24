import type { Operation } from "@cybermasterchef/core";

export const keepHexChars: Operation = {
  id: "text.keepHexChars",
  name: "Keep Hex Chars",
  description: "Keeps hexadecimal characters only.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    return { type: "string", value: input.value.replace(/[^0-9a-fA-F]+/gu, "") };
  }
};

import type { Operation } from "@cybermasterchef/core";

export const keepNonAscii: Operation = {
  id: "text.keepNonAscii",
  name: "Keep Non-ASCII",
  description: "Keeps non-ASCII characters only.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    return { type: "string", value: input.value.replace(/[\x00-\x7F]+/gu, "") };
  }
};

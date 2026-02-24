import type { Operation } from "@cybermasterchef/core";

export const normalizeNewlines: Operation = {
  id: "text.normalizeNewlines",
  name: "Normalize Newlines",
  description: "Normalizes CRLF to LF.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    return { type: "string", value: input.value.replace(/\r\n/gu, "\n") };
  }
};

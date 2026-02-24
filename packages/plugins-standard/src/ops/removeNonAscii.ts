import type { Operation } from "@cybermasterchef/core";

export const removeNonAscii: Operation = {
  id: "text.removeNonAscii",
  name: "Remove Non-ASCII",
  description: "Removes non-ASCII characters.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    return { type: "string", value: input.value.replace(/[^\x00-\x7F]+/gu, "") };
  }
};

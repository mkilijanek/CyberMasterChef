import type { Operation } from "@cybermasterchef/core";

export const keepAlnum: Operation = {
  id: "text.keepAlnum",
  name: "Keep Alnum",
  description: "Keeps alphanumeric ASCII characters only.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    return { type: "string", value: input.value.replace(/[^A-Za-z0-9]+/gu, "") };
  }
};

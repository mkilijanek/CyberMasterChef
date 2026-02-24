import type { Operation } from "@cybermasterchef/core";

export const removeAlnum: Operation = {
  id: "text.removeAlnum",
  name: "Remove Alnum",
  description: "Removes alphanumeric ASCII characters.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    return { type: "string", value: input.value.replace(/[A-Za-z0-9]+/gu, "") };
  }
};

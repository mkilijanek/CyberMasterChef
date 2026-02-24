import type { Operation } from "@cybermasterchef/core";

export const firstLine: Operation = {
  id: "text.firstLine",
  name: "First Line",
  description: "Returns the first line of text.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    const first = input.value.split(/\r?\n/u)[0] ?? "";
    return { type: "string", value: first };
  }
};

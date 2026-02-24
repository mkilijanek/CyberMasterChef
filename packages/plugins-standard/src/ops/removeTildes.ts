import type { Operation } from "@cybermasterchef/core";

export const removeTildes: Operation = {
  id: "text.removeTildes",
  name: "Remove Tildes",
  description: "Removes tilde characters.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    return { type: "string", value: input.value.replace(/~+/gu, "") };
  }
};

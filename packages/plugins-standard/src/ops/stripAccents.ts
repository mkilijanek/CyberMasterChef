import type { Operation } from "@cybermasterchef/core";

export const stripAccents: Operation = {
  id: "text.stripAccents",
  name: "Strip Accents",
  description: "Removes combining accent marks.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    return { type: "string", value: input.value.normalize("NFD").replace(/\p{M}+/gu, "") };
  }
};

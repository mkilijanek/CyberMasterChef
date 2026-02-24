import type { Operation } from "@cybermasterchef/core";

export const onlyAlnumAndSpaces: Operation = {
  id: "text.onlyAlnumAndSpaces",
  name: "Only Alnum And Spaces",
  description: "Keeps alphanumeric characters and spaces only.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    return { type: "string", value: input.value.replace(/[^A-Za-z0-9 ]+/gu, "") };
  }
};

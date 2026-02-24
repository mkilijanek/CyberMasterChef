import type { Operation } from "@cybermasterchef/core";

export const onlyLettersAndSpaces: Operation = {
  id: "text.onlyLettersAndSpaces",
  name: "Only Letters And Spaces",
  description: "Keeps letters and spaces only.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    return { type: "string", value: input.value.replace(/[^A-Za-z ]+/gu, "") };
  }
};

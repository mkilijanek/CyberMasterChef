import type { Operation } from "@cybermasterchef/core";

export const removeQuestionMarks: Operation = {
  id: "text.removeQuestionMarks",
  name: "Remove Question Marks",
  description: "Removes question marks.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    return { type: "string", value: input.value.replace(/\?+/gu, "") };
  }
};

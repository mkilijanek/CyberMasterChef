import type { Operation } from "@cybermasterchef/core";

export const replaceSpacesWithNewlines: Operation = {
  id: "text.replaceSpacesWithNewlines",
  name: "Spaces To Newlines",
  description: "Replaces one or more spaces with newlines.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    return { type: "string", value: input.value.replace(/ +/gu, "\n") };
  }
};

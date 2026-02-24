import type { Operation } from "@cybermasterchef/core";

export const removeEquals: Operation = {
  id: "text.removeEquals",
  name: "Remove Equals",
  description: "Removes equals signs.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    return { type: "string", value: input.value.replace(/=+/gu, "") };
  }
};

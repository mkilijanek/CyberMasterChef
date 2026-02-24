import type { Operation } from "@cybermasterchef/core";

export const removeAngles: Operation = {
  id: "text.removeAngles",
  name: "Remove Angle Brackets",
  description: "Removes angle brackets.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    return { type: "string", value: input.value.replace(/[<>]+/gu, "") };
  }
};

import type { Operation } from "@cybermasterchef/core";
import { encodeBraille } from "./brailleUtils.js";

export const toBraille: Operation = {
  id: "codec.toBraille",
  name: "To Braille",
  description: "Converts text to six-dot braille symbols.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    return { type: "string", value: encodeBraille(input.value) };
  }
};

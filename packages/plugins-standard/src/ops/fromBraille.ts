import type { Operation } from "@cybermasterchef/core";
import { decodeBraille } from "./brailleUtils.js";

export const fromBraille: Operation = {
  id: "codec.fromBraille",
  name: "From Braille",
  description: "Converts six-dot braille symbols to text.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    return { type: "string", value: decodeBraille(input.value) };
  }
};

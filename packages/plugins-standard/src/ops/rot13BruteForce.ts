import type { Operation } from "@cybermasterchef/core";
import { applyRot13, formatRotBruteForce } from "./rotUtils.js";

export const rot13BruteForce: Operation = {
  id: "text.rot13BruteForce",
  name: "ROT13 Brute Force",
  description: "Generates all Caesar rotations for Latin letters as brute-force candidates.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    return { type: "string", value: formatRotBruteForce(input.value, 26, applyRot13) };
  }
};

import type { Operation } from "@cybermasterchef/core";
import { applyRot47, formatRotBruteForce } from "./rotUtils.js";

export const rot47BruteForce: Operation = {
  id: "text.rot47BruteForce",
  name: "ROT47 Brute Force",
  description: "Generates all ROT47 shifts for printable ASCII characters.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    return { type: "string", value: formatRotBruteForce(input.value, 94, applyRot47) };
  }
};

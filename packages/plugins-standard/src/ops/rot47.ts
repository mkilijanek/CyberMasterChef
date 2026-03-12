import type { Operation } from "@cybermasterchef/core";
import { applyRot47 } from "./rotUtils.js";

export const rot47: Operation = {
  id: "text.rot47",
  name: "ROT47",
  description: "Applies ROT47 substitution for printable ASCII characters.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    return { type: "string", value: applyRot47(input.value) };
  }
};

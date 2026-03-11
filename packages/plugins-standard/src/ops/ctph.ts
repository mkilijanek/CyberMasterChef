import type { Operation } from "@cybermasterchef/core";
import ssdeep from "ssdeep.js";
import { inputToBytes, toAscii } from "./forensicUtils.js";

export const ctph: Operation = {
  id: "forensic.ctph",
  name: "CTPH",
  description: "Computes a context-triggered piecewise hash (ssdeep-compatible digest).",
  input: ["bytes", "string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    const bytes = inputToBytes(input);
    if (bytes.length === 0) return { type: "string", value: "" };
    return { type: "string", value: ssdeep.digest(toAscii(bytes)) };
  }
};

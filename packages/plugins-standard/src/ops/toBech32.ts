import type { Operation } from "@cybermasterchef/core";
import { encodeBech32 } from "./bech32Utils.js";

export const toBech32: Operation = {
  id: "codec.toBech32",
  name: "To Bech32",
  description: "Encodes bytes or string to Bech32 with a configurable HRP.",
  input: ["bytes", "string"],
  output: "string",
  args: [
    {
      key: "hrp",
      label: "Human-Readable Part",
      type: "string",
      defaultValue: "cmc"
    }
  ],
  run: ({ input, args }) => {
    if (input.type !== "bytes" && input.type !== "string") {
      throw new Error("Expected bytes or string input");
    }
    const hrp = typeof args.hrp === "string" && args.hrp.trim() ? args.hrp : "cmc";
    const bytes = input.type === "bytes" ? input.value : new TextEncoder().encode(input.value);
    return { type: "string", value: encodeBech32(hrp, bytes) };
  }
};

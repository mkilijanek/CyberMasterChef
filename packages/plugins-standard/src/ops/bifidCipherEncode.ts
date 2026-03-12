import type { Operation } from "@cybermasterchef/core";
import { bifidEncodeText } from "./polybiusUtils.js";

export const bifidCipherEncode: Operation = {
  id: "crypto.bifidCipherEncode",
  name: "Bifid Cipher Encode",
  description: "Encodes text with the Bifid cipher using a Polybius square.",
  input: ["string"],
  output: "string",
  args: [
    { key: "keyword", label: "Keyword", type: "string", defaultValue: "" },
    { key: "period", label: "Period", type: "number", defaultValue: 5 }
  ],
  run: ({ input, args }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    return { type: "string", value: bifidEncodeText(input.value, args.keyword, args.period) };
  }
};

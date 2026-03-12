import type { Operation } from "@cybermasterchef/core";
import { bifidDecodeText } from "./polybiusUtils.js";

export const bifidCipherDecode: Operation = {
  id: "crypto.bifidCipherDecode",
  name: "Bifid Cipher Decode",
  description: "Decodes text produced by the Bifid cipher using a Polybius square.",
  input: ["string"],
  output: "string",
  args: [
    { key: "keyword", label: "Keyword", type: "string", defaultValue: "" },
    { key: "period", label: "Period", type: "number", defaultValue: 5 }
  ],
  run: ({ input, args }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    return { type: "string", value: bifidDecodeText(input.value, args.keyword, args.period) };
  }
};

import type { Operation } from "@cybermasterchef/core";
import { normalizeRails, railPattern } from "./railFenceCipherEncode.js";

export const railFenceCipherDecode: Operation = {
  id: "crypto.railFenceCipherDecode",
  name: "Rail Fence Cipher Decode",
  description: "Decodes text produced by the zig-zag rail fence transposition cipher.",
  input: ["string"],
  output: "string",
  args: [{ key: "rails", label: "Rails", type: "number", defaultValue: 3 }],
  run: ({ input, args }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    const rails = normalizeRails(args.rails);
    if (input.value.length <= 1) return { type: "string", value: input.value };

    const pattern = railPattern(input.value.length, rails);
    const counts = Array.from({ length: rails }, () => 0);
    for (const rail of pattern) counts[rail]! += 1;

    const segments: string[] = [];
    let offset = 0;
    for (const count of counts) {
      segments.push(input.value.slice(offset, offset + count));
      offset += count;
    }

    const indices = Array.from({ length: rails }, () => 0);
    let output = "";
    for (const rail of pattern) {
      output += segments[rail]![indices[rail]!]!;
      indices[rail]! += 1;
    }
    return { type: "string", value: output };
  }
};

import type { Operation } from "@cybermasterchef/core";

function normalizeRails(value: unknown): number {
  const rails =
    typeof value === "number"
      ? Math.floor(value)
      : typeof value === "string" && value.trim() !== ""
        ? Number.parseInt(value, 10)
        : 3;
  if (!Number.isInteger(rails) || rails < 2) {
    throw new Error("Rails must be an integer greater than or equal to 2");
  }
  return rails;
}

function railPattern(length: number, rails: number): number[] {
  const pattern: number[] = [];
  let rail = 0;
  let direction = 1;
  for (let index = 0; index < length; index += 1) {
    pattern.push(rail);
    if (rail === 0) direction = 1;
    else if (rail === rails - 1) direction = -1;
    rail += direction;
  }
  return pattern;
}

export const railFenceCipherEncode: Operation = {
  id: "crypto.railFenceCipherEncode",
  name: "Rail Fence Cipher Encode",
  description: "Encodes text with the zig-zag rail fence transposition cipher.",
  input: ["string"],
  output: "string",
  args: [{ key: "rails", label: "Rails", type: "number", defaultValue: 3 }],
  run: ({ input, args }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    const rails = normalizeRails(args.rails);
    if (input.value.length <= 1) return { type: "string", value: input.value };

    const buckets = Array.from({ length: rails }, () => "");
    const pattern = railPattern(input.value.length, rails);
    for (let index = 0; index < input.value.length; index += 1) {
      buckets[pattern[index]!] += input.value[index]!;
    }
    return { type: "string", value: buckets.join("") };
  }
};

export { normalizeRails, railPattern };

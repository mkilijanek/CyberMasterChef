import type { Operation } from "@cybermasterchef/core";

function normalizeSize(value: unknown, inputLength: number): number {
  const parsed =
    typeof value === "number"
      ? Math.floor(value)
      : typeof value === "string" && value.trim() !== ""
        ? Number.parseInt(value, 10)
        : Math.ceil(Math.sqrt(inputLength));
  if (!Number.isInteger(parsed) || parsed < 2) {
    throw new Error("Size must be an integer greater than or equal to 2");
  }
  return parsed;
}

export const caesarBoxCipher: Operation = {
  id: "crypto.caesarBoxCipher",
  name: "Caesar Box Cipher",
  description: "Transposes text through a square Caesar box and returns the columnar readout.",
  input: ["string"],
  output: "string",
  args: [{ key: "size", label: "Size", type: "number", defaultValue: "" }],
  run: ({ input, args }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    const value = input.value;
    if (value.length === 0) return { type: "string", value: "" };

    const size = normalizeSize(args.size, value.length);
    const padded = value.padEnd(size * size, "X");
    let output = "";
    for (let column = 0; column < size; column += 1) {
      for (let row = 0; row < size; row += 1) {
        output += padded[row * size + column]!;
      }
    }
    return { type: "string", value: output };
  }
};

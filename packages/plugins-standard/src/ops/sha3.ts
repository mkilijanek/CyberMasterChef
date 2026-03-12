import type { Operation } from "@cybermasterchef/core";

function normalizeBits(value: unknown): 224 | 256 | 384 | 512 {
  if (value === 224 || value === 256 || value === 384 || value === 512) return value;
  if (value === "224" || value === "256" || value === "384" || value === "512") {
    return Number.parseInt(value, 10) as 224 | 256 | 384 | 512;
  }
  return 512;
}

export const sha3: Operation = {
  id: "hash.sha3",
  name: "SHA3",
  description: "Computes SHA-3 digest for the selected output size. Output is lowercase hex string.",
  input: ["bytes", "string"],
  output: "string",
  args: [
    {
      key: "bits",
      label: "Bits",
      type: "select",
      defaultValue: "512",
      options: [
        { label: "224", value: "224" },
        { label: "256", value: "256" },
        { label: "384", value: "384" },
        { label: "512", value: "512" }
      ]
    }
  ],
  run: async ({ input, args }) => {
    const { sha3 } = (await import("hash-wasm")) as {
      sha3: (data: Uint8Array, bits?: 224 | 256 | 384 | 512) => Promise<string>;
    };
    if (input.type !== "bytes" && input.type !== "string") {
      throw new Error("Expected bytes or string input");
    }
    const bytes =
      input.type === "bytes" ? input.value : new TextEncoder().encode(input.value);
    const digest = await sha3(bytes, normalizeBits(args.bits));
    return { type: "string", value: digest };
  }
};

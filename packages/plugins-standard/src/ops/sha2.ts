import type { Operation } from "@cybermasterchef/core";

function normalizeBits(value: unknown): 224 | 256 | 384 | 512 {
  if (value === 224 || value === 256 || value === 384 || value === 512) return value;
  if (value === "224" || value === "256" || value === "384" || value === "512") {
    return Number.parseInt(value, 10) as 224 | 256 | 384 | 512;
  }
  return 256;
}

export const sha2: Operation = {
  id: "hash.sha2",
  name: "SHA2",
  description: "Computes SHA-2 digest for the selected output size. Output is lowercase hex string.",
  input: ["bytes", "string"],
  output: "string",
  args: [
    {
      key: "bits",
      label: "Bits",
      type: "select",
      defaultValue: "256",
      options: [
        { label: "224", value: "224" },
        { label: "256", value: "256" },
        { label: "384", value: "384" },
        { label: "512", value: "512" }
      ]
    }
  ],
  run: async ({ input, args }) => {
    if (input.type !== "bytes" && input.type !== "string") {
      throw new Error("Expected bytes or string input");
    }

    const bytes =
      input.type === "bytes" ? input.value : new TextEncoder().encode(input.value);
    const bits = normalizeBits(args.bits);
    const mod = (await import("hash-wasm")) as {
      sha224: (data: Uint8Array) => Promise<string>;
      sha256: (data: Uint8Array) => Promise<string>;
      sha384: (data: Uint8Array) => Promise<string>;
      sha512: (data: Uint8Array) => Promise<string>;
    };

    const digest =
      bits === 224
        ? await mod.sha224(bytes)
        : bits === 256
          ? await mod.sha256(bytes)
          : bits === 384
            ? await mod.sha384(bytes)
            : await mod.sha512(bytes);
    return { type: "string", value: digest };
  }
};

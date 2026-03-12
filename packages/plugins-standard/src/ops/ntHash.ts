import type { Operation } from "@cybermasterchef/core";

export function toUtf16LeBytes(value: string): Uint8Array {
  const out = new Uint8Array(value.length * 2);
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);
    out[index * 2] = code & 0xff;
    out[index * 2 + 1] = code >>> 8;
  }
  return out;
}

export const ntHash: Operation = {
  id: "hash.ntHash",
  name: "NT Hash",
  description: "Computes the NT hash (MD4 over UTF-16LE text). Output is lowercase hex string.",
  input: ["string"],
  output: "string",
  args: [],
  run: async ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    const { md4 } = (await import("hash-wasm")) as {
      md4: (data: Uint8Array) => Promise<string>;
    };
    return { type: "string", value: await md4(toUtf16LeBytes(input.value)) };
  }
};

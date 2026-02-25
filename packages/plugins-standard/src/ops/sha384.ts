import type { Operation } from "@cybermasterchef/core";
import { bytesToHex } from "@cybermasterchef/core";

async function digestSha384(data: Uint8Array): Promise<Uint8Array> {
  const subtle = globalThis.crypto?.subtle;
  if (!subtle) {
    throw new Error("WebCrypto is not available in this environment");
  }
  const safeData = Uint8Array.from(data);
  const out = await subtle.digest("SHA-384", safeData);
  return new Uint8Array(out);
}

export const sha384: Operation = {
  id: "hash.sha384",
  name: "SHA-384",
  description: "Computes SHA-384 digest. Output is lowercase hex string.",
  input: ["bytes", "string"],
  output: "string",
  args: [],
  run: async ({ input }) => {
    if (input.type !== "bytes" && input.type !== "string") {
      throw new Error("Expected bytes or string input");
    }
    const bytes =
      input.type === "bytes" ? input.value : new TextEncoder().encode(input.value);
    const digest = await digestSha384(bytes);
    return { type: "string", value: bytesToHex(digest) };
  }
};

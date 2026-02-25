import type { Operation } from "@cybermasterchef/core";
import { bytesToHex } from "@cybermasterchef/core";

async function digestSha512(data: Uint8Array): Promise<Uint8Array> {
  const subtle = globalThis.crypto?.subtle;
  if (!subtle) {
    throw new Error("WebCrypto is not available in this environment");
  }
  const safeData = Uint8Array.from(data);
  const out = await subtle.digest("SHA-512", safeData);
  return new Uint8Array(out);
}

export const sha512: Operation = {
  id: "hash.sha512",
  name: "SHA-512",
  description: "Computes SHA-512 digest. Output is lowercase hex string.",
  input: ["bytes", "string"],
  output: "string",
  args: [],
  run: async ({ input }) => {
    if (input.type !== "bytes" && input.type !== "string") {
      throw new Error("Expected bytes or string input");
    }
    const bytes =
      input.type === "bytes" ? input.value : new TextEncoder().encode(input.value);
    const digest = await digestSha512(bytes);
    return { type: "string", value: bytesToHex(digest) };
  }
};

import type { Operation } from "@cybermasterchef/core";
import { bytesToHex } from "@cybermasterchef/core";

async function digestSha256(data: Uint8Array): Promise<Uint8Array> {
  const subtle = globalThis.crypto?.subtle;
  if (!subtle) {
    throw new Error("WebCrypto is not available in this environment");
  }
  // Copy into a plain Uint8Array to satisfy strict BufferSource typings.
  const safeData = Uint8Array.from(data);
  const out = await subtle.digest("SHA-256", safeData);
  return new Uint8Array(out);
}

export const sha256: Operation = {
  id: "hash.sha256",
  name: "SHA-256",
  description: "Computes SHA-256 digest. Output is lowercase hex string.",
  input: ["bytes", "string"],
  output: "string",
  args: [],
  run: async ({ input }) => {
    if (input.type !== "bytes" && input.type !== "string") {
      throw new Error("Expected bytes or string input");
    }
    const bytes =
      input.type === "bytes" ? input.value : new TextEncoder().encode(input.value);
    const digest = await digestSha256(bytes);
    return { type: "string", value: bytesToHex(digest) };
  }
};

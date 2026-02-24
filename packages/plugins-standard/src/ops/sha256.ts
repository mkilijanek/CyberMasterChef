import type { Operation } from "@cybermasterchef/core";
import { bytesToHex } from "@cybermasterchef/core";

async function digestSha256(data: Uint8Array): Promise<Uint8Array> {
  const subtle = globalThis.crypto?.subtle;
  if (subtle) {
    const out = await subtle.digest("SHA-256", data);
    return new Uint8Array(out);
  }
  // Node 20+ fallback
  const nodeCrypto = await import("node:crypto");
  const out = await nodeCrypto.webcrypto.subtle.digest("SHA-256", data);
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
    const bytes =
      input.type === "bytes" ? input.value : new TextEncoder().encode(input.value);
    const digest = await digestSha256(bytes);
    return { type: "string", value: bytesToHex(digest) };
  }
};

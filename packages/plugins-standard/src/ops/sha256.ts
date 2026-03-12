import type { Operation } from "@cybermasterchef/core";
import { bytesToHex } from "@cybermasterchef/core";
import { sha256 as sha256Hash } from "hash-wasm";

async function digestSha256(data: Uint8Array): Promise<Uint8Array> {
  const subtle = globalThis.crypto?.subtle;
  if (subtle) {
    // Copy into a plain Uint8Array to satisfy strict BufferSource typings.
    const safeData = Uint8Array.from(data);
    const out = await subtle.digest("SHA-256", safeData);
    return new Uint8Array(out);
  }

  const hexDigest = await sha256Hash(Uint8Array.from(data));
  const bytes = new Uint8Array(hexDigest.length / 2);
  for (let index = 0; index < bytes.length; index += 1) {
    const pair = hexDigest.slice(index * 2, index * 2 + 2);
    bytes[index] = Number.parseInt(pair, 16);
  }
  return bytes;
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

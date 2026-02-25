import type { Operation } from "@cybermasterchef/core";
import { bytesToHex } from "@cybermasterchef/core";
import { decodeBytes, normalizeEncoding } from "./cryptoKeyUtils.js";

async function signHmac(
  data: Uint8Array,
  key: Uint8Array,
  hash: "SHA-256"
): Promise<Uint8Array> {
  const subtle = globalThis.crypto?.subtle;
  if (!subtle) {
    throw new Error("WebCrypto is not available in this environment");
  }
  const safeKey = Uint8Array.from(key);
  const safeData = Uint8Array.from(data);
  const cryptoKey = await subtle.importKey(
    "raw",
    safeKey,
    { name: "HMAC", hash },
    false,
    ["sign"]
  );
  const signature = await subtle.sign("HMAC", cryptoKey, safeData);
  return new Uint8Array(signature);
}

export const hmacSha256: Operation = {
  id: "crypto.hmacSha256",
  name: "HMAC-SHA256",
  description: "Computes HMAC-SHA256 for input data and a provided key.",
  input: ["bytes", "string"],
  output: "string",
  args: [
    {
      key: "key",
      label: "Key",
      type: "string",
      defaultValue: ""
    },
    {
      key: "keyEncoding",
      label: "Key Encoding",
      type: "select",
      defaultValue: "utf8",
      options: [
        { label: "UTF-8", value: "utf8" },
        { label: "Hex", value: "hex" },
        { label: "Base64", value: "base64" }
      ]
    }
  ],
  run: async ({ input, args }) => {
    if (input.type !== "bytes" && input.type !== "string") {
      throw new Error("Expected bytes or string input");
    }
    const keyRaw = typeof args.key === "string" ? args.key : "";
    if (!keyRaw) throw new Error("Key argument is required");

    const encoding = normalizeEncoding(args.keyEncoding, "utf8");
    const keyBytes = decodeBytes(keyRaw, encoding);
    const data =
      input.type === "bytes" ? input.value : new TextEncoder().encode(input.value);
    const signature = await signHmac(data, keyBytes, "SHA-256");
    return { type: "string", value: bytesToHex(signature) };
  }
};

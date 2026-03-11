import { decodeBytes, normalizeEncoding } from "./cryptoKeyUtils.js";

export type HmacFactory = () => Promise<{
  init: () => void;
  update: (input: Uint8Array | string) => void;
  digest: (encoding: "hex") => string;
}>;

export async function computeHashWasmHmac(
  input: { type: string; value: unknown },
  args: Record<string, unknown>,
  createHash: HmacFactory
): Promise<string> {
  if (input.type !== "bytes" && input.type !== "string") {
    throw new Error("Expected bytes or string input");
  }

  const keyRaw = typeof args.key === "string" ? args.key : "";
  if (!keyRaw) throw new Error("Key argument is required");

  const encoding = normalizeEncoding(args.keyEncoding, "utf8");
  const keyBytes = decodeBytes(keyRaw, encoding);
  const { createHMAC } = (await import("hash-wasm")) as {
    createHMAC: (hash: Promise<unknown>, key: Uint8Array) => Promise<{
      init: () => void;
      update: (input: Uint8Array | string) => void;
      digest: (encoding: "hex") => string;
    }>;
  };
  const hmac = await createHMAC(createHash(), keyBytes);
  hmac.init();
  hmac.update(input.value as Uint8Array | string);
  return hmac.digest("hex");
}

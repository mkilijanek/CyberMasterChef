import type { Operation } from "@cybermasterchef/core";
import { computeHashWasmHmac } from "./hmacHashWasmUtils.js";

export const hmacSha224: Operation = {
  id: "crypto.hmacSha224",
  name: "HMAC-SHA224",
  description: "Computes HMAC-SHA224 for input data and a provided key.",
  input: ["bytes", "string"],
  output: "string",
  args: [
    { key: "key", label: "Key", type: "string", defaultValue: "" },
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
    const { createSHA224 } = (await import("hash-wasm")) as {
      createSHA224: () => Promise<{
        init: () => void;
        update: (input: Uint8Array | string) => void;
        digest: (encoding: "hex") => string;
      }>;
    };
    const digest = await computeHashWasmHmac(input, args, createSHA224);
    return { type: "string", value: digest };
  }
};

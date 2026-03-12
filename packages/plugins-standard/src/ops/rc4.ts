import type { Operation } from "@cybermasterchef/core";
import { toBytes } from "./byteTransformUtils.js";
import { normalizeRc4Key, rc4Transform } from "./rc4Utils.js";

export const rc4: Operation = {
  id: "crypto.rc4",
  name: "RC4",
  description: "Encrypts or decrypts bytes with the RC4 stream cipher.",
  input: ["bytes", "string"],
  output: "bytes",
  args: [{ key: "passphrase", label: "Passphrase", type: "string", defaultValue: "" }],
  run: ({ input, args }) => {
    const bytes = toBytes(input);
    const key = normalizeRc4Key(args.passphrase);
    return { type: "bytes", value: rc4Transform(bytes, key) };
  }
};

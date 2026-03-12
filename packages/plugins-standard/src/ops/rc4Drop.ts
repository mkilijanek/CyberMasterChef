import type { Operation } from "@cybermasterchef/core";
import { toBytes } from "./byteTransformUtils.js";
import { normalizeRc4Drop, normalizeRc4Key, rc4Transform } from "./rc4Utils.js";

export const rc4Drop: Operation = {
  id: "crypto.rc4Drop",
  name: "RC4 Drop",
  description: "Encrypts or decrypts bytes with RC4 after discarding the first keystream bytes.",
  input: ["bytes", "string"],
  output: "bytes",
  args: [
    { key: "passphrase", label: "Passphrase", type: "string", defaultValue: "" },
    { key: "drop", label: "Drop", type: "number", defaultValue: 768 }
  ],
  run: ({ input, args }) => {
    const bytes = toBytes(input);
    const key = normalizeRc4Key(args.passphrase);
    const drop = normalizeRc4Drop(args.drop);
    return { type: "bytes", value: rc4Transform(bytes, key, drop) };
  }
};

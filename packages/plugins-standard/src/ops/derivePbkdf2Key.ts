import type { Operation } from "@cybermasterchef/core";
import { pbkdf2 } from "./pbkdf2.js";

export const derivePbkdf2Key: Operation = {
  id: "crypto.derivePbkdf2Key",
  name: "Derive PBKDF2 Key",
  description: "Derives key material using PBKDF2 (hex output).",
  input: ["bytes", "string"],
  output: "string",
  args: [
    {
      key: "salt",
      label: "Salt",
      type: "string",
      defaultValue: ""
    },
    {
      key: "saltEncoding",
      label: "Salt Encoding",
      type: "select",
      defaultValue: "utf8"
    },
    {
      key: "iterations",
      label: "Iterations",
      type: "number",
      defaultValue: 10000
    },
    {
      key: "length",
      label: "Key Length (bytes)",
      type: "number",
      defaultValue: 32
    },
    {
      key: "hash",
      label: "Hash",
      type: "select",
      defaultValue: "SHA-256"
    }
  ],
  run: pbkdf2.run
};

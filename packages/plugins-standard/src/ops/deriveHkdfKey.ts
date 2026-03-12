import type { Operation } from "@cybermasterchef/core";
import { hkdf } from "./hkdf.js";

export const deriveHkdfKey: Operation = {
  id: "crypto.deriveHkdfKey",
  name: "Derive HKDF Key",
  description: "Derives key material using HKDF (hex output).",
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
      key: "info",
      label: "Info",
      type: "string",
      defaultValue: ""
    },
    {
      key: "infoEncoding",
      label: "Info Encoding",
      type: "select",
      defaultValue: "utf8"
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
  run: hkdf.run
};

import type { Operation } from "@cybermasterchef/core";
import { hkdf } from "./hkdf.js";

export const deriveHkdfKey: Operation = {
  ...hkdf,
  id: "crypto.deriveHkdfKey",
  name: "Derive HKDF Key",
  description: "Derives key material using HKDF (hex output)."
};

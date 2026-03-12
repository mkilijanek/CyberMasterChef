import type { Operation } from "@cybermasterchef/core";
import { pbkdf2 } from "./pbkdf2.js";

export const derivePbkdf2Key: Operation = {
  ...pbkdf2,
  id: "crypto.derivePbkdf2Key",
  name: "Derive PBKDF2 Key",
  description: "Derives key material using PBKDF2 (hex output)."
};

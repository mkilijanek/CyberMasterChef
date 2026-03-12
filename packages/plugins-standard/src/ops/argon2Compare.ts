import type { Operation } from "@cybermasterchef/core";
import { argon2Verify } from "./argon2Verify.js";

export const argon2Compare: Operation = {
  ...argon2Verify,
  id: "crypto.argon2Compare",
  name: "Argon2 Compare",
  description: "Compares a password against an encoded Argon2 hash string."
};

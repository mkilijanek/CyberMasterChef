import type { Operation } from "@cybermasterchef/core";
import { argon2Verify } from "./argon2Verify.js";

export const argon2Compare: Operation = {
  id: "crypto.argon2Compare",
  name: "Argon2 Compare",
  description: "Compares a password against an encoded Argon2 hash string.",
  input: ["bytes", "string"],
  output: "json",
  args: [{ key: "hash", label: "Encoded Hash", type: "string", defaultValue: "" }],
  run: argon2Verify.run
};

import type { Operation } from "@cybermasterchef/core";
import { bcryptVerify } from "./bcryptVerify.js";

export const bcryptCompare: Operation = {
  id: "crypto.bcryptCompare",
  name: "Bcrypt Compare",
  description: "Compares a password against a bcrypt hash string.",
  input: ["bytes", "string"],
  output: "json",
  args: [{ key: "hash", label: "Bcrypt Hash", type: "string", defaultValue: "" }],
  run: (ctx) => bcryptVerify.run(ctx)
};

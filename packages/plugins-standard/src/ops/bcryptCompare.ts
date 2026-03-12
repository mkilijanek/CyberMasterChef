import type { Operation } from "@cybermasterchef/core";
import { bcryptVerify } from "./bcryptVerify.js";

export const bcryptCompare: Operation = {
  ...bcryptVerify,
  id: "crypto.bcryptCompare",
  name: "Bcrypt Compare",
  description: "Compares a password against a bcrypt hash string."
};

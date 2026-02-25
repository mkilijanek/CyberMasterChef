import type { Operation } from "@cybermasterchef/core";

type BcryptParsed = {
  isValid: boolean;
  version?: string;
  cost?: number;
  salt?: string;
  hash?: string;
};

const BCRYPT_RE = /^\$(2[abxy])\$(\d{2})\$([./A-Za-z0-9]{53})$/;

export const bcryptParse: Operation = {
  id: "crypto.bcryptParse",
  name: "Bcrypt Parse",
  description: "Parses bcrypt hash into version, cost, salt, and hash components.",
  input: ["string"],
  output: "json",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    const trimmed = input.value.trim();
    const match = trimmed.match(BCRYPT_RE);
    if (!match) {
      const invalid: BcryptParsed = { isValid: false };
      return { type: "json", value: invalid };
    }
    const version = match[1] ?? "2b";
    const cost = Number.parseInt(match[2] ?? "10", 10);
    const payload = match[3] ?? "";
    const salt = payload.slice(0, 22);
    const hash = payload.slice(22);
    const parsed: BcryptParsed = {
      isValid: true,
      version,
      cost,
      salt,
      hash
    };
    return { type: "json", value: parsed };
  }
};

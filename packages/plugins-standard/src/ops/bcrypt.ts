import type { Operation } from "@cybermasterchef/core";

function normalizeRounds(value: unknown): number {
  const rounds =
    typeof value === "number"
      ? value
      : typeof value === "string" && value.trim() !== ""
        ? Number.parseInt(value, 10)
        : 10;
  if (!Number.isInteger(rounds) || rounds < 4 || rounds > 31) {
    throw new Error("Rounds must be an integer between 4 and 31");
  }
  return rounds;
}

export const bcrypt: Operation = {
  id: "crypto.bcrypt",
  name: "Bcrypt",
  description: "Hashes input with bcrypt and returns the encoded bcrypt hash string.",
  input: ["bytes", "string"],
  output: "string",
  args: [
    { key: "rounds", label: "Rounds", type: "number", defaultValue: 10 },
    {
      key: "salt",
      label: "Salt",
      type: "string",
      defaultValue: "0123456789abcdef"
    },
    {
      key: "saltEncoding",
      label: "Salt Encoding",
      type: "select",
      defaultValue: "utf8",
      options: [
        { label: "UTF-8", value: "utf8" },
        { label: "Hex", value: "hex" }
      ]
    }
  ],
  run: async ({ input, args }) => {
    if (input.type !== "bytes" && input.type !== "string") {
      throw new Error("Expected bytes or string input");
    }
    const saltValue = typeof args.salt === "string" ? args.salt : "";
    if (!saltValue) {
      throw new Error("Salt argument is required");
    }
    const salt =
      args.saltEncoding === "hex"
        ? Uint8Array.from(Buffer.from(saltValue, "hex"))
        : new TextEncoder().encode(saltValue);
    if (salt.length !== 16) {
      throw new Error("Salt must decode to exactly 16 bytes");
    }

    const { bcrypt } = (await import("hash-wasm")) as {
      bcrypt: (options: {
        password: string | Uint8Array;
        salt: Uint8Array;
        costFactor: number;
      }) => Promise<string>;
    };
    const password = input.type === "bytes" ? input.value : input.value;
    const hash = await bcrypt({ password, salt, costFactor: normalizeRounds(args.rounds) });
    return { type: "string", value: hash };
  }
};

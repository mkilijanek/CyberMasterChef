import type { Operation } from "@cybermasterchef/core";

export const argon2Verify: Operation = {
  id: "crypto.argon2Verify",
  name: "Argon2 Verify",
  description: "Verifies a password against an encoded Argon2 hash string.",
  input: ["bytes", "string"],
  output: "json",
  args: [{ key: "hash", label: "Encoded Hash", type: "string", defaultValue: "" }],
  run: async ({ input, args }) => {
    if (input.type !== "bytes" && input.type !== "string") {
      throw new Error("Expected bytes or string input");
    }
    const hash = typeof args.hash === "string" ? args.hash : "";
    if (!hash) throw new Error("Hash argument is required");

    const { argon2Verify } = (await import("hash-wasm")) as {
      argon2Verify: (options: { password: string | Uint8Array; hash: string }) => Promise<boolean>;
    };
    const password = input.type === "bytes" ? input.value : input.value;
    const matches = await argon2Verify({ password, hash });
    return { type: "json", value: { matches } };
  }
};

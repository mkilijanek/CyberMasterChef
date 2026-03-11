import type { Operation } from "@cybermasterchef/core";

export const bcryptVerify: Operation = {
  id: "crypto.bcryptVerify",
  name: "Bcrypt Verify",
  description: "Verifies a password against a bcrypt hash string.",
  input: ["bytes", "string"],
  output: "json",
  args: [{ key: "hash", label: "Bcrypt Hash", type: "string", defaultValue: "" }],
  run: async ({ input, args }) => {
    if (input.type !== "bytes" && input.type !== "string") {
      throw new Error("Expected bytes or string input");
    }
    const hash = typeof args.hash === "string" ? args.hash : "";
    if (!hash) throw new Error("Hash argument is required");

    const { bcryptVerify } = (await import("hash-wasm")) as {
      bcryptVerify: (options: { password: string | Uint8Array; hash: string }) => Promise<boolean>;
    };
    const password = input.type === "bytes" ? input.value : input.value;
    const matches = await bcryptVerify({ password, hash });
    return { type: "json", value: { matches } };
  }
};

import type { Operation } from "@cybermasterchef/core";
import { parseArgon2Options } from "./argon2Utils.js";

export const argon2id: Operation = {
  id: "crypto.argon2id",
  name: "Argon2id",
  description: "Derives an Argon2id hash string or hex digest.",
  input: ["bytes", "string"],
  output: "string",
  args: [
    { key: "salt", label: "Salt", type: "string", defaultValue: "" },
    {
      key: "saltEncoding",
      label: "Salt Encoding",
      type: "select",
      defaultValue: "utf8",
      options: [
        { label: "UTF-8", value: "utf8" },
        { label: "Hex", value: "hex" },
        { label: "Base64", value: "base64" }
      ]
    },
    { key: "iterations", label: "Iterations", type: "number", defaultValue: 3 },
    { key: "memorySize", label: "Memory (KiB)", type: "number", defaultValue: 65536 },
    { key: "parallelism", label: "Parallelism", type: "number", defaultValue: 1 },
    { key: "hashLength", label: "Hash Length", type: "number", defaultValue: 32 },
    {
      key: "outputType",
      label: "Output",
      type: "select",
      defaultValue: "encoded",
      options: [
        { label: "Encoded", value: "encoded" },
        { label: "Hex", value: "hex" }
      ]
    }
  ],
  run: async ({ input, args }) => {
    if (input.type !== "bytes" && input.type !== "string") {
      throw new Error("Expected bytes or string input");
    }
    const { argon2id } = (await import("hash-wasm")) as {
      argon2id: (options: ReturnType<typeof parseArgon2Options>) => Promise<string>;
    };
    const options = parseArgon2Options(input, args);
    const hash = await argon2id(options);
    return { type: "string", value: hash };
  }
};

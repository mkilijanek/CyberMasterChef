import type { Operation } from "@cybermasterchef/core";
import { argon2id } from "./argon2id.js";

export const argon2: Operation = {
  id: "crypto.argon2",
  name: "Argon2",
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
  run: (ctx) => argon2id.run(ctx)
};

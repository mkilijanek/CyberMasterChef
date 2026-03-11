import type { Operation } from "@cybermasterchef/core";

const BASE45_ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:";

function encodeBase45(bytes: Uint8Array): string {
  let out = "";
  for (let i = 0; i < bytes.length; i += 2) {
    const first = bytes[i] ?? 0;
    const second = bytes[i + 1];
    if (second === undefined) {
      let value = first;
      out += BASE45_ALPHABET[value % 45] ?? "";
      value = Math.floor(value / 45);
      out += BASE45_ALPHABET[value % 45] ?? "";
      continue;
    }

    let value = first * 256 + second;
    out += BASE45_ALPHABET[value % 45] ?? "";
    value = Math.floor(value / 45);
    out += BASE45_ALPHABET[value % 45] ?? "";
    value = Math.floor(value / 45);
    out += BASE45_ALPHABET[value % 45] ?? "";
  }
  return out;
}

export const toBase45: Operation = {
  id: "codec.toBase45",
  name: "To Base45",
  description: "Encodes bytes or string to RFC 9285 Base45.",
  input: ["bytes", "string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "bytes" && input.type !== "string") {
      throw new Error("Expected bytes or string input");
    }
    const bytes =
      input.type === "bytes" ? input.value : new TextEncoder().encode(input.value);
    return { type: "string", value: encodeBase45(bytes) };
  }
};

import type { Operation } from "@cybermasterchef/core";

function encodeChunk(chunk: Uint8Array): string {
  let value = 0;
  for (let i = 0; i < 4; i += 1) {
    value = (value << 8) | (chunk[i] ?? 0);
  }
  if (value === 0 && chunk.length === 4) {
    return "z";
  }
  const out = new Array<string>(5).fill("!");
  for (let i = 4; i >= 0; i -= 1) {
    out[i] = String.fromCharCode((value % 85) + 33);
    value = Math.floor(value / 85);
  }
  return out.slice(0, chunk.length + 1).join("");
}

function encodeBase85(bytes: Uint8Array): string {
  if (bytes.length === 0) return "";
  const parts: string[] = [];
  for (let i = 0; i < bytes.length; i += 4) {
    parts.push(encodeChunk(bytes.slice(i, i + 4)));
  }
  return parts.join("");
}

export const toBase85: Operation = {
  id: "codec.toBase85",
  name: "To Base85",
  description: "Encodes bytes or string to ASCII85/Base85.",
  input: ["bytes", "string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "bytes" && input.type !== "string") {
      throw new Error("Expected bytes or string input");
    }
    const bytes = input.type === "bytes" ? input.value : new TextEncoder().encode(input.value);
    return { type: "string", value: encodeBase85(bytes) };
  }
};

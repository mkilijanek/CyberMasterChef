import type { Operation } from "@cybermasterchef/core";

function findHeaderBoundary(bytes: Uint8Array): number {
  for (let i = 0; i + 3 < bytes.length; i += 1) {
    if (bytes[i] === 13 && bytes[i + 1] === 10 && bytes[i + 2] === 13 && bytes[i + 3] === 10) {
      return i + 4;
    }
  }
  for (let i = 0; i + 1 < bytes.length; i += 1) {
    if (bytes[i] === 10 && bytes[i + 1] === 10) {
      return i + 2;
    }
  }
  return -1;
}

export const stripHttpHeaders: Operation = {
  id: "network.stripHttpHeaders",
  name: "Strip HTTP Headers",
  description: "Strips HTTP headers and returns the payload body only.",
  input: ["bytes", "string"],
  output: "bytes",
  args: [],
  run: ({ input }) => {
    if (input.type !== "bytes" && input.type !== "string") {
      throw new Error("Expected bytes or string input");
    }
    const bytes =
      input.type === "bytes" ? input.value : new TextEncoder().encode(input.value);
    const boundary = findHeaderBoundary(bytes);
    if (boundary === -1) {
      throw new Error("HTTP header terminator not found");
    }
    return { type: "bytes", value: bytes.slice(boundary) };
  }
};

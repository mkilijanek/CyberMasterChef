import type { Operation } from "@cybermasterchef/core";

function dechunk(data: Uint8Array): Uint8Array {
  let offset = 0;
  const chunks: Uint8Array[] = [];
  let total = 0;

  const readLine = (): string => {
    for (let i = offset; i + 1 < data.length; i++) {
      if (data[i] === 13 && data[i + 1] === 10) {
        const lineBytes = data.slice(offset, i);
        offset = i + 2;
        return new TextDecoder().decode(lineBytes);
      }
    }
    throw new Error("Invalid chunked encoding: missing CRLF");
  };

  while (offset < data.length) {
    const line = readLine().trim();
    if (!line) {
      continue;
    }
    const sizeToken = line.split(";", 1)[0] ?? "";
    const size = Number.parseInt(sizeToken, 16);
    if (!Number.isFinite(size) || size < 0) {
      throw new Error(`Invalid chunk size: ${line}`);
    }
    if (size === 0) {
      break;
    }
    if (offset + size > data.length) {
      throw new Error("Invalid chunked encoding: chunk exceeds input size");
    }
    const chunk = data.slice(offset, offset + size);
    chunks.push(chunk);
    total += chunk.length;
    offset += size;
    if (offset + 1 >= data.length || data[offset] !== 13 || data[offset + 1] !== 10) {
      throw new Error("Invalid chunked encoding: missing chunk CRLF");
    }
    offset += 2;
  }

  const output = new Uint8Array(total);
  let cursor = 0;
  for (const chunk of chunks) {
    output.set(chunk, cursor);
    cursor += chunk.length;
  }
  return output;
}

export const dechunkHttpResponse: Operation = {
  id: "network.dechunkHttpResponse",
  name: "Dechunk HTTP Response",
  description: "Decodes HTTP chunked transfer-encoded payload into raw bytes.",
  input: ["bytes", "string"],
  output: "bytes",
  args: [],
  run: ({ input }) => {
    if (input.type !== "bytes" && input.type !== "string") {
      throw new Error("Expected bytes or string input");
    }
    const bytes =
      input.type === "bytes" ? input.value : new TextEncoder().encode(input.value);
    const decoded = dechunk(bytes);
    return { type: "bytes", value: decoded };
  }
};

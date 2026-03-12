import type { Operation } from "@cybermasterchef/core";

function murmurHash3(bytes: Uint8Array, seed = 0): number {
  let hash = seed >>> 0;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const c1 = 0xcc9e2d51;
  const c2 = 0x1b873593;

  const blockCount = Math.floor(bytes.length / 4);
  for (let index = 0; index < blockCount; index += 1) {
    let k = view.getUint32(index * 4, true);
    k = Math.imul(k, c1);
    k = (k << 15) | (k >>> 17);
    k = Math.imul(k, c2);

    hash ^= k;
    hash = (hash << 13) | (hash >>> 19);
    hash = (Math.imul(hash, 5) + 0xe6546b64) >>> 0;
  }

  let tail = 0;
  const tailIndex = blockCount * 4;
  switch (bytes.length & 3) {
    case 3:
      tail ^= bytes[tailIndex + 2]! << 16;
    // falls through
    case 2:
      tail ^= bytes[tailIndex + 1]! << 8;
    // falls through
    case 1:
      tail ^= bytes[tailIndex]!;
      tail = Math.imul(tail, c1);
      tail = (tail << 15) | (tail >>> 17);
      tail = Math.imul(tail, c2);
      hash ^= tail;
      break;
    default:
      break;
  }

  hash ^= bytes.length;
  hash ^= hash >>> 16;
  hash = Math.imul(hash, 0x85ebca6b);
  hash ^= hash >>> 13;
  hash = Math.imul(hash, 0xc2b2ae35);
  hash ^= hash >>> 16;
  return hash >>> 0;
}

export const murmurHash3Op: Operation = {
  id: "hash.murmurHash3",
  name: "MurmurHash3",
  description: "Computes MurmurHash3 x86 32-bit digest. Output is lowercase hex string.",
  input: ["bytes", "string"],
  output: "string",
  args: [
    {
      key: "seed",
      label: "Seed",
      type: "number",
      defaultValue: 0
    }
  ],
  run: ({ input, args }) => {
    if (input.type !== "bytes" && input.type !== "string") {
      throw new Error("Expected bytes or string input");
    }
    const seed = typeof args.seed === "number" && Number.isInteger(args.seed) ? args.seed >>> 0 : 0;
    const bytes =
      input.type === "bytes" ? input.value : new TextEncoder().encode(input.value);
    return {
      type: "string",
      value: murmurHash3(bytes, seed).toString(16).padStart(8, "0")
    };
  }
};

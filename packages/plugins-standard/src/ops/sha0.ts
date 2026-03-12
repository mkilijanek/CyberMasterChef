import type { Operation } from "@cybermasterchef/core";
import { bytesToHex } from "@cybermasterchef/core";
import { toBytes } from "./byteTransformUtils.js";

function leftRotate(value: number, bits: number): number {
  return ((value << bits) | (value >>> (32 - bits))) >>> 0;
}

export function sha0Digest(data: Uint8Array): Uint8Array {
  const bitLength = data.length * 8;
  const paddedLength = Math.ceil((data.length + 9) / 64) * 64;
  const padded = new Uint8Array(paddedLength);
  padded.set(data);
  padded[data.length] = 0x80;

  const view = new DataView(padded.buffer);
  view.setUint32(paddedLength - 8, Math.floor(bitLength / 0x100000000), false);
  view.setUint32(paddedLength - 4, bitLength >>> 0, false);

  let h0 = 0x67452301;
  let h1 = 0xefcdab89;
  let h2 = 0x98badcfe;
  let h3 = 0x10325476;
  let h4 = 0xc3d2e1f0;

  const words = new Uint32Array(80);

  for (let offset = 0; offset < padded.length; offset += 64) {
    for (let index = 0; index < 16; index += 1) {
      words[index] = view.getUint32(offset + index * 4, false);
    }
    for (let index = 16; index < 80; index += 1) {
      words[index] =
        (words[index - 3]! ^ words[index - 8]! ^ words[index - 14]! ^ words[index - 16]!) >>> 0;
    }

    let a = h0;
    let b = h1;
    let c = h2;
    let d = h3;
    let e = h4;

    for (let index = 0; index < 80; index += 1) {
      const f =
        index < 20
          ? (b & c) | (~b & d)
          : index < 40
            ? b ^ c ^ d
            : index < 60
              ? (b & c) | (b & d) | (c & d)
              : b ^ c ^ d;
      const k =
        index < 20
          ? 0x5a827999
          : index < 40
            ? 0x6ed9eba1
            : index < 60
              ? 0x8f1bbcdc
              : 0xca62c1d6;

      const temp = (leftRotate(a, 5) + f + e + k + words[index]!) >>> 0;
      e = d;
      d = c;
      c = leftRotate(b, 30);
      b = a;
      a = temp;
    }

    h0 = (h0 + a) >>> 0;
    h1 = (h1 + b) >>> 0;
    h2 = (h2 + c) >>> 0;
    h3 = (h3 + d) >>> 0;
    h4 = (h4 + e) >>> 0;
  }

  const digest = new Uint8Array(20);
  const digestView = new DataView(digest.buffer);
  digestView.setUint32(0, h0, false);
  digestView.setUint32(4, h1, false);
  digestView.setUint32(8, h2, false);
  digestView.setUint32(12, h3, false);
  digestView.setUint32(16, h4, false);
  return digest;
}

export const sha0: Operation = {
  id: "hash.sha0",
  name: "SHA0",
  description: "Computes SHA-0 digest. Output is lowercase hex string.",
  input: ["bytes", "string"],
  output: "string",
  args: [],
  run: ({ input }) => ({ type: "string", value: bytesToHex(sha0Digest(toBytes(input))) })
};

import type { Operation } from "@cybermasterchef/core";

type ElfInfo = {
  isElf: boolean;
  class?: "ELF32" | "ELF64" | "unknown";
  endianness?: "little" | "big" | "unknown";
  version?: number;
  osabi?: number;
  abiVersion?: number;
  type?: number;
  machine?: number;
  entry?: string;
};

function readU16(bytes: Uint8Array, offset: number, little: boolean): number {
  if (offset + 1 >= bytes.length) return 0;
  const a = bytes[offset] ?? 0;
  const b = bytes[offset + 1] ?? 0;
  return little ? (a | (b << 8)) : ((a << 8) | b);
}

function readU32(bytes: Uint8Array, offset: number, little: boolean): number {
  if (offset + 3 >= bytes.length) return 0;
  const b0 = bytes[offset] ?? 0;
  const b1 = bytes[offset + 1] ?? 0;
  const b2 = bytes[offset + 2] ?? 0;
  const b3 = bytes[offset + 3] ?? 0;
  return little
    ? ((b0 | (b1 << 8) | (b2 << 16) | (b3 << 24)) >>> 0)
    : ((b3 | (b2 << 8) | (b1 << 16) | (b0 << 24)) >>> 0);
}

function readU64(bytes: Uint8Array, offset: number, little: boolean): string {
  if (offset + 7 >= bytes.length) return "0";
  let result = 0n;
  for (let i = 0; i < 8; i++) {
    const idx = little ? offset + (7 - i) : offset + i;
    result = (result << 8n) | BigInt(bytes[idx] ?? 0);
  }
  return result.toString();
}

export const elfInfo: Operation = {
  id: "forensic.elfInfo",
  name: "ELF Info",
  description: "Extracts basic ELF header metadata.",
  input: ["bytes", "string"],
  output: "json",
  args: [],
  run: ({ input }) => {
    if (input.type !== "bytes" && input.type !== "string") {
      throw new Error("Expected bytes or string input");
    }
    const bytes =
      input.type === "bytes" ? input.value : new TextEncoder().encode(input.value);
    if (
      bytes.length < 18 ||
      bytes[0] !== 0x7f ||
      bytes[1] !== 0x45 ||
      bytes[2] !== 0x4c ||
      bytes[3] !== 0x46
    ) {
      const info: ElfInfo = { isElf: false };
      return { type: "json", value: info };
    }
    const cls = bytes[4];
    const endian = bytes[5];
    const classLabel = cls === 1 ? "ELF32" : cls === 2 ? "ELF64" : "unknown";
    const endianLabel = endian === 1 ? "little" : endian === 2 ? "big" : "unknown";
    const little = endian === 1;
    const info: ElfInfo = {
      isElf: true,
      class: classLabel,
      endianness: endianLabel,
      version: bytes[6] ?? 0,
      osabi: bytes[7] ?? 0,
      abiVersion: bytes[8] ?? 0,
      type: readU16(bytes, 16, little),
      machine: readU16(bytes, 18, little)
    };
    if (classLabel === "ELF32") {
      info.entry = readU32(bytes, 24, little).toString();
    } else if (classLabel === "ELF64") {
      info.entry = readU64(bytes, 24, little);
    }
    return { type: "json", value: info };
  }
};

const MODHEX_ALPHABET = "cbdefghijklnrtuv";
const HEX_ALPHABET = "0123456789abcdef";

const MODHEX_MAP = new Map(MODHEX_ALPHABET.split("").map((char, index) => [char, index]));

export function encodeModhex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => {
    const high = MODHEX_ALPHABET[(byte >> 4) & 0x0f];
    const low = MODHEX_ALPHABET[byte & 0x0f];
    return `${high}${low}`;
  }).join("");
}

export function decodeModhex(input: string): Uint8Array {
  const normalized = input.toLowerCase().replace(/\s+/g, "");
  if (!normalized) return new Uint8Array();
  if (normalized.length % 2 !== 0) {
    throw new Error("Modhex input must contain an even number of characters");
  }

  let hex = "";
  for (const char of normalized) {
    const index = MODHEX_MAP.get(char);
    if (index === undefined) {
      throw new Error(`Invalid Modhex character: ${char}`);
    }
    hex += HEX_ALPHABET[index];
  }

  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

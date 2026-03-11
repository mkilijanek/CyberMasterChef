const CHARSET = "qpzry9x8gf2tvdw0s3jn54khce6mua7l";
const CHARSET_MAP = new Map(CHARSET.split("").map((char, index) => [char, index]));
const GENERATORS = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3];

function polymod(values: number[]): number {
  let chk = 1;
  for (const value of values) {
    const top = chk >>> 25;
    chk = ((chk & 0x1ffffff) << 5) ^ value;
    for (let i = 0; i < 5; i += 1) {
      if (((top >>> i) & 1) !== 0) {
        chk ^= GENERATORS[i] ?? 0;
      }
    }
  }
  return chk >>> 0;
}

function hrpExpand(hrp: string): number[] {
  const expanded: number[] = [];
  for (const char of hrp) expanded.push(char.charCodeAt(0) >>> 5);
  expanded.push(0);
  for (const char of hrp) expanded.push(char.charCodeAt(0) & 31);
  return expanded;
}

function createChecksum(hrp: string, data: number[]): number[] {
  const values = [...hrpExpand(hrp), ...data, 0, 0, 0, 0, 0, 0];
  const mod = polymod(values) ^ 1;
  const checksum = new Array<number>(6).fill(0);
  for (let i = 0; i < 6; i += 1) {
    checksum[i] = (mod >>> (5 * (5 - i))) & 31;
  }
  return checksum;
}

function verifyChecksum(hrp: string, data: number[]): boolean {
  return polymod([...hrpExpand(hrp), ...data]) === 1;
}

export function convertBits(data: number[], fromBits: number, toBits: number, pad: boolean): number[] {
  let acc = 0;
  let bits = 0;
  const maxv = (1 << toBits) - 1;
  const result: number[] = [];
  for (const value of data) {
    if (value < 0 || value >>> fromBits !== 0) {
      throw new Error("Invalid Bech32 data value");
    }
    acc = (acc << fromBits) | value;
    bits += fromBits;
    while (bits >= toBits) {
      bits -= toBits;
      result.push((acc >>> bits) & maxv);
    }
  }
  if (pad) {
    if (bits > 0) {
      result.push((acc << (toBits - bits)) & maxv);
    }
  } else if (bits >= fromBits || ((acc << (toBits - bits)) & maxv) !== 0) {
    throw new Error("Invalid Bech32 padding");
  }
  return result;
}

export function encodeBech32(hrp: string, bytes: Uint8Array): string {
  const normalizedHrp = hrp.trim().toLowerCase();
  if (!/^[ -~]+$/.test(normalizedHrp)) {
    throw new Error("Invalid Bech32 HRP");
  }
  const data = convertBits(Array.from(bytes), 8, 5, true);
  const combined = [...data, ...createChecksum(normalizedHrp, data)];
  return `${normalizedHrp}1${combined.map((value) => CHARSET[value] ?? "").join("")}`;
}

export function decodeBech32(value: string): { hrp: string; bytes: Uint8Array } {
  const normalized = value.trim().toLowerCase();
  const separator = normalized.lastIndexOf("1");
  if (separator < 1 || separator + 7 > normalized.length) {
    throw new Error("Invalid Bech32 string");
  }
  const hrp = normalized.slice(0, separator);
  const dataPart = normalized.slice(separator + 1);
  const data = Array.from(dataPart).map((char) => {
    const decoded = CHARSET_MAP.get(char);
    if (decoded === undefined) {
      throw new Error(`Invalid Bech32 character: ${char}`);
    }
    return decoded;
  });
  if (!verifyChecksum(hrp, data)) {
    throw new Error("Invalid Bech32 checksum");
  }
  const payload = data.slice(0, -6);
  return {
    hrp,
    bytes: Uint8Array.from(convertBits(payload, 5, 8, false))
  };
}

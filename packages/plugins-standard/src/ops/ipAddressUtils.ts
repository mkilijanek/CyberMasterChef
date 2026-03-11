export function isValidIpv4(value: string): boolean {
  const parts = value.split(".");
  if (parts.length !== 4) return false;
  return parts.every((part) => {
    if (!/^\d{1,3}$/.test(part)) return false;
    if (part.length > 1 && part.startsWith("0")) return false;
    const num = Number(part);
    return Number.isInteger(num) && num >= 0 && num <= 255;
  });
}

export function ipv4ToInt(ip: string): number {
  const [a, b, c, d] = ip.split(".").map((part) => Number(part));
  return (((a ?? 0) << 24) | ((b ?? 0) << 16) | ((c ?? 0) << 8) | (d ?? 0)) >>> 0;
}

export function intToIpv4(value: number): string {
  return [
    (value >>> 24) & 255,
    (value >>> 16) & 255,
    (value >>> 8) & 255,
    value & 255
  ].join(".");
}

function parseEmbeddedIpv4(token: string): number[] {
  if (!isValidIpv4(token)) {
    throw new Error(`Invalid embedded IPv4 address: ${token}`);
  }
  const raw = ipv4ToInt(token);
  return [(raw >>> 16) & 0xffff, raw & 0xffff];
}

function parseIpv6Side(side: string): number[] {
  if (!side) return [];
  const tokens = side.split(":");
  const values: number[] = [];
  for (const token of tokens) {
    if (!token) {
      throw new Error("Invalid IPv6 address");
    }
    if (token.includes(".")) {
      if (token !== tokens[tokens.length - 1]) {
        throw new Error("Embedded IPv4 address must be the final IPv6 token");
      }
      values.push(...parseEmbeddedIpv4(token));
      continue;
    }
    if (!/^[0-9a-fA-F]{1,4}$/.test(token)) {
      throw new Error(`Invalid IPv6 hextet: ${token}`);
    }
    values.push(Number.parseInt(token, 16));
  }
  return values;
}

export function expandIpv6(input: string): { hextets: number[]; zone?: string } {
  const trimmed = input.trim().toLowerCase();
  if (!trimmed) throw new Error("Expected IPv6 address");

  const withoutBrackets =
    trimmed.startsWith("[") && trimmed.endsWith("]") ? trimmed.slice(1, -1) : trimmed;
  const [address, zone] = withoutBrackets.split("%", 2);
  if (!address) throw new Error("Expected IPv6 address");

  const doubleColonCount = (address.match(/::/g) ?? []).length;
  if (doubleColonCount > 1) {
    throw new Error("Invalid IPv6 address");
  }

  const [leftRaw, rightRaw] = address.split("::", 2);
  const left = parseIpv6Side(leftRaw ?? "");
  const right = parseIpv6Side(rightRaw ?? "");

  let hextets: number[];
  if (doubleColonCount === 1) {
    const missing = 8 - (left.length + right.length);
    if (missing < 1) {
      throw new Error("Invalid IPv6 compression");
    }
    hextets = [...left, ...new Array<number>(missing).fill(0), ...right];
  } else {
    hextets = left;
  }

  if (hextets.length !== 8) {
    throw new Error("Invalid IPv6 address");
  }

  return zone ? { hextets, zone } : { hextets };
}

export function ipv6ToBigInt(hextets: number[]): bigint {
  return hextets.reduce((acc, part) => (acc << 16n) | BigInt(part), 0n);
}

export function bigIntToIpv6(value: bigint): number[] {
  const hextets = new Array<number>(8).fill(0);
  let raw = value;
  for (let i = 7; i >= 0; i -= 1) {
    hextets[i] = Number(raw & 0xffffn);
    raw >>= 16n;
  }
  return hextets;
}

export function compressIpv6(hextets: number[]): string {
  let bestStart = -1;
  let bestLength = 0;
  let currentStart = -1;
  let currentLength = 0;

  for (let i = 0; i <= hextets.length; i += 1) {
    if (i < hextets.length && hextets[i] === 0) {
      if (currentStart === -1) currentStart = i;
      currentLength += 1;
      continue;
    }
    if (currentLength > bestLength && currentLength >= 2) {
      bestStart = currentStart;
      bestLength = currentLength;
    }
    currentStart = -1;
    currentLength = 0;
  }

  if (bestStart === -1) {
    return hextets.map((part) => part.toString(16)).join(":");
  }

  const left = hextets.slice(0, bestStart).map((part) => part.toString(16)).join(":");
  const right = hextets
    .slice(bestStart + bestLength)
    .map((part) => part.toString(16))
    .join(":");

  if (!left && !right) return "::";
  if (!left) return `::${right}`;
  if (!right) return `${left}::`;
  return `${left}::${right}`;
}

export function expandIpv6String(hextets: number[]): string {
  return hextets.map((part) => part.toString(16).padStart(4, "0")).join(":");
}

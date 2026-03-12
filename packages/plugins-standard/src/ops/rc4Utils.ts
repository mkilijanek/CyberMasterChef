export function normalizeRc4Key(value: unknown): Uint8Array {
  if (typeof value !== "string" || value.length === 0) {
    throw new Error("Passphrase must be a non-empty string");
  }
  return new TextEncoder().encode(value);
}

export function normalizeRc4Drop(value: unknown): number {
  if (value === undefined || value === null || value === "") return 0;
  const drop =
    typeof value === "number"
      ? Math.floor(value)
      : typeof value === "string" && value.trim() !== ""
        ? Number.parseInt(value, 10)
        : 0;
  if (!Number.isInteger(drop) || drop < 0) {
    throw new Error("Drop must be a non-negative integer");
  }
  return drop;
}

export function rc4Transform(data: Uint8Array, key: Uint8Array, drop = 0): Uint8Array {
  const s = Uint8Array.from({ length: 256 }, (_, index) => index);
  let j = 0;
  for (let i = 0; i < 256; i += 1) {
    j = (j + s[i]! + key[i % key.length]!) & 0xff;
    [s[i], s[j]] = [s[j]!, s[i]!];
  }

  let i = 0;
  j = 0;
  for (let skipped = 0; skipped < drop; skipped += 1) {
    i = (i + 1) & 0xff;
    j = (j + s[i]!) & 0xff;
    [s[i], s[j]] = [s[j]!, s[i]!];
  }

  const out = new Uint8Array(data.length);
  for (let index = 0; index < data.length; index += 1) {
    i = (i + 1) & 0xff;
    j = (j + s[i]!) & 0xff;
    [s[i], s[j]] = [s[j]!, s[i]!];
    out[index] = data[index]! ^ s[(s[i]! + s[j]!) & 0xff]!;
  }
  return out;
}

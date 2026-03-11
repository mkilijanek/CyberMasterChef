export function base92Chr(value: number): string {
  if (value < 0 || value >= 91) {
    throw new Error("Invalid Base92 value");
  }
  if (value === 0) return "!";
  if (value <= 61) return String.fromCharCode("#".charCodeAt(0) + value - 1);
  return String.fromCharCode("a".charCodeAt(0) + value - 62);
}

export function base92Ord(value: string): number {
  if (value === "!") return 0;
  if (value >= "#" && value <= "_") return value.charCodeAt(0) - "#".charCodeAt(0) + 1;
  if (value >= "a" && value <= "}") return value.charCodeAt(0) - "a".charCodeAt(0) + 62;
  throw new Error(`Invalid Base92 character: ${value}`);
}

export function encodeBase92(input: Uint8Array): string {
  let source = "";
  for (const byte of input) {
    source += String.fromCharCode(byte);
  }

  const result: string[] = [];
  let bitString = "";

  while (source.length > 0) {
    while (bitString.length < 13 && source.length > 0) {
      bitString += source.charCodeAt(0).toString(2).padStart(8, "0");
      source = source.slice(1);
    }
    if (bitString.length < 13) break;
    const value = Number.parseInt(bitString.slice(0, 13), 2);
    result.push(base92Chr(Math.floor(value / 91)));
    result.push(base92Chr(value % 91));
    bitString = bitString.slice(13);
  }

  if (bitString.length > 0) {
    if (bitString.length < 7) {
      result.push(base92Chr(Number.parseInt(bitString.padEnd(6, "0"), 2)));
    } else {
      const value = Number.parseInt(bitString.padEnd(13, "0"), 2);
      result.push(base92Chr(Math.floor(value / 91)));
      result.push(base92Chr(value % 91));
    }
  }

  return result.join("");
}

export function decodeBase92(input: string): Uint8Array {
  const trimmed = input.trim();
  if (!trimmed) return new Uint8Array();

  const result: number[] = [];
  let bitString = "";

  for (let index = 0; index < trimmed.length; index += 2) {
    if (index + 1 < trimmed.length) {
      const value = base92Ord(trimmed[index] ?? "") * 91 + base92Ord(trimmed[index + 1] ?? "");
      bitString += value.toString(2).padStart(13, "0");
    } else {
      bitString += base92Ord(trimmed[index] ?? "").toString(2).padStart(6, "0");
    }

    while (bitString.length >= 8) {
      result.push(Number.parseInt(bitString.slice(0, 8), 2));
      bitString = bitString.slice(8);
    }
  }

  return Uint8Array.from(result);
}

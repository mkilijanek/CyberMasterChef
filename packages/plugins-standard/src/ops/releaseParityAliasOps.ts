import type { Operation } from "@cybermasterchef/core";
import { urlEncode } from "./urlEncode.js";
import { urlDecode } from "./urlDecode.js";
import { extractUrls } from "./extractUrls.js";
import { parseUri } from "./parseUri.js";
import { parseIPv6Address } from "./parseIPv6Address.js";
import { stripTcpHeader } from "./stripTcpHeader.js";
import { stripUdpHeader } from "./stripUdpHeader.js";
import { stripHttpHeaders } from "./stripHttpHeaders.js";
import { stripIPv4Header } from "./stripIPv4Header.js";
import { analyseUuid } from "./analyseUuid.js";
import { chiSquareOp } from "./chiSquare.js";
import { generateUuid } from "./generateUuid.js";
import { extractStrings } from "./extractStrings.js";
import { sum } from "./sum.js";
import { subtract } from "./subtract.js";
import { multiply } from "./multiply.js";
import { divide } from "./divide.js";
import { escapeString } from "./escapeString.js";
import { expandAlphabetRange } from "./expandAlphabetRange.js";
import { alternatingCaps } from "./alternatingCaps.js";
import { toFloat } from "./toFloat.js";
import { fromFloat } from "./fromFloat.js";
import { atbashCipher } from "./atbashCipher.js";
import { affineCipherEncode } from "./affineCipherEncode.js";
import { affineCipherDecode } from "./affineCipherDecode.js";
import { a1z26CipherEncode } from "./a1z26CipherEncode.js";
import { a1z26CipherDecode } from "./a1z26CipherDecode.js";
import { baconCipherEncode } from "./baconCipherEncode.js";
import { baconCipherDecode } from "./baconCipherDecode.js";
import { sha1 } from "./sha1.js";
import { sha224 } from "./sha224.js";
import { sha256 } from "./sha256.js";
import { sha384 } from "./sha384.js";
import { sha512 } from "./sha512.js";
import { hashMd5 } from "./hashMd5.js";
import { ripemd160 } from "./ripemd160.js";
import { blake2b } from "./blake2b.js";
import { blake2s } from "./blake2s.js";
import { hmacSha1 } from "./hmacSha1.js";
import { hkdf } from "./hkdf.js";
import { pbkdf2 } from "./pbkdf2.js";
import { scrypt } from "./scrypt.js";

function createAliasOperation(id: string, name: string, description: string, target: Operation): Operation {
  return {
    id,
    name,
    description,
    input: target.input,
    output: target.output,
    args: target.args,
    run: (ctx) => target.run(ctx)
  };
}

function normalizeEncoding(value: string | undefined): string {
  return (value ?? "utf-8").trim().toLowerCase();
}

function encodeTextBytes(text: string, encoding: string): Uint8Array {
  switch (encoding) {
    case "utf-8":
    case "utf8":
      return new TextEncoder().encode(text);
    case "utf-16le":
    case "utf16le": {
      const bytes = new Uint8Array(text.length * 2);
      for (let index = 0; index < text.length; index += 1) {
        const code = text.charCodeAt(index);
        bytes[index * 2] = code & 0xff;
        bytes[index * 2 + 1] = code >> 8;
      }
      return bytes;
    }
    case "utf-16be":
    case "utf16be": {
      const bytes = new Uint8Array(text.length * 2);
      for (let index = 0; index < text.length; index += 1) {
        const code = text.charCodeAt(index);
        bytes[index * 2] = code >> 8;
        bytes[index * 2 + 1] = code & 0xff;
      }
      return bytes;
    }
    default:
      throw new Error(`Unsupported text encoding: ${encoding}`);
  }
}

function decodeTextBytes(bytes: Uint8Array, encoding: string): string {
  switch (encoding) {
    case "utf-8":
    case "utf8":
      return new TextDecoder().decode(bytes);
    case "utf-16le":
    case "utf16le": {
      if (bytes.length % 2 !== 0) throw new Error("UTF-16 input must contain an even number of bytes");
      let text = "";
      for (let index = 0; index < bytes.length; index += 2) {
        text += String.fromCharCode(bytes[index]! | (bytes[index + 1]! << 8));
      }
      return text;
    }
    case "utf-16be":
    case "utf16be": {
      if (bytes.length % 2 !== 0) throw new Error("UTF-16 input must contain an even number of bytes");
      let text = "";
      for (let index = 0; index < bytes.length; index += 2) {
        text += String.fromCharCode((bytes[index]! << 8) | bytes[index + 1]!);
      }
      return text;
    }
    default:
      throw new Error(`Unsupported text encoding: ${encoding}`);
  }
}

function parseHexInput(input: string): Uint8Array {
  const normalized = input.replace(/\s+/g, "");
  if (normalized.length === 0) return new Uint8Array();
  if (normalized.length % 2 !== 0 || /[^0-9a-f]/iu.test(normalized)) {
    throw new Error("Expected even-length hexadecimal input");
  }
  return Uint8Array.from(Buffer.from(normalized, "hex"));
}

function toHex(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString("hex");
}

function encodeOid(value: string): Uint8Array {
  const arcs = value.split(".").map((part) => {
    if (!/^\d+$/u.test(part)) throw new Error("OID arcs must be unsigned integers");
    return Number(part);
  });
  if (arcs.length < 2) throw new Error("OID must contain at least two arcs");
  const firstArc = arcs[0]!;
  const secondArc = arcs[1]!;
  if (firstArc < 0 || firstArc > 2) throw new Error("OID first arc must be 0, 1, or 2");
  if (firstArc < 2 && (secondArc < 0 || secondArc > 39)) {
    throw new Error("OID second arc must be between 0 and 39 when the first arc is 0 or 1");
  }

  const encoded = [firstArc * 40 + secondArc];
  for (const arc of arcs.slice(2)) {
    if (!Number.isSafeInteger(arc) || arc < 0) throw new Error("OID arcs must be safe positive integers");
    const stack = [arc & 0x7f];
    let remaining = arc >>> 7;
    while (remaining > 0) {
      stack.push((remaining & 0x7f) | 0x80);
      remaining >>>= 7;
    }
    encoded.push(...stack.reverse());
  }
  return Uint8Array.from(encoded);
}

function decodeOid(bytes: Uint8Array): string {
  if (bytes.length === 0) throw new Error("OID hex input cannot be empty");
  const first = bytes[0]!;
  const arcs = [Math.min(2, Math.floor(first / 40)), first >= 80 ? first - 80 : first % 40];
  let current = 0;
  let hasOpenArc = false;
  for (const byte of bytes.slice(1)) {
    current = (current << 7) | (byte & 0x7f);
    hasOpenArc = true;
    if ((byte & 0x80) === 0) {
      arcs.push(current);
      current = 0;
      hasOpenArc = false;
    }
  }
  if (hasOpenArc) throw new Error("OID hex input ended mid-arc");
  return arcs.join(".");
}

function parsePemBlocks(input: string): Uint8Array {
  const matches = Array.from(
    input.matchAll(/-----BEGIN [^-]+-----\s*([A-Za-z0-9+/=\r\n]+)\s*-----END [^-]+-----/gu)
  );
  if (matches.length === 0) throw new Error("No PEM block found");
  return Uint8Array.from(
    Buffer.from(
      matches.map((match) => match[1]!.replace(/\s+/gu, "")).join(""),
      "base64"
    )
  );
}

export const encodeText: Operation = {
  id: "codec.encodeText",
  name: "Encode Text",
  description: "Encodes text into bytes using UTF-8 or UTF-16.",
  input: ["string"],
  output: "bytes",
  args: [{ key: "encoding", label: "Encoding", type: "string", defaultValue: "utf-8" }],
  run: ({ input, args }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    return {
      type: "bytes",
      value: encodeTextBytes(input.value, normalizeEncoding(args.encoding as string | undefined))
    };
  }
};

export const decodeText: Operation = {
  id: "codec.decodeText",
  name: "Decode Text",
  description: "Decodes bytes into text using UTF-8 or UTF-16.",
  input: ["bytes", "string"],
  output: "string",
  args: [{ key: "encoding", label: "Encoding", type: "string", defaultValue: "utf-8" }],
  run: ({ input, args }) => {
    if (input.type !== "bytes" && input.type !== "string") {
      throw new Error("Expected bytes or string input");
    }
    const bytes = input.type === "bytes" ? input.value : new TextEncoder().encode(input.value);
    return {
      type: "string",
      value: decodeTextBytes(bytes, normalizeEncoding(args.encoding as string | undefined))
    };
  }
};

export const objectIdentifierToHex: Operation = {
  id: "codec.objectIdentifierToHex",
  name: "Object Identifier To Hex",
  description: "Encodes a dotted object identifier into DER hex form.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    return { type: "string", value: toHex(encodeOid(input.value.trim())) };
  }
};

export const hexToObjectIdentifier: Operation = {
  id: "codec.hexToObjectIdentifier",
  name: "Hex To Object Identifier",
  description: "Decodes DER-encoded object identifier hex into dotted notation.",
  input: ["string", "bytes"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "bytes" && input.type !== "string") {
      throw new Error("Expected bytes or string input");
    }
    const bytes = input.type === "bytes" ? input.value : parseHexInput(input.value);
    return { type: "string", value: decodeOid(bytes) };
  }
};

export const pemToHex: Operation = {
  id: "codec.pemToHex",
  name: "PEM To Hex",
  description: "Decodes PEM blocks into lowercase hexadecimal bytes.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    return { type: "string", value: toHex(parsePemBlocks(input.value)) };
  }
};

export const hexToPem: Operation = {
  id: "network.hexToPem",
  name: "Hex To PEM",
  description: "Encodes hex bytes into a PEM block with a configurable header.",
  input: ["string", "bytes"],
  output: "string",
  args: [{ key: "header", label: "Header", type: "string", defaultValue: "CERTIFICATE" }],
  run: ({ input, args }) => {
    if (input.type !== "bytes" && input.type !== "string") {
      throw new Error("Expected bytes or string input");
    }
    const header = String((args.header as string | undefined) ?? "CERTIFICATE").trim() || "CERTIFICATE";
    const bytes = input.type === "bytes" ? input.value : parseHexInput(input.value);
    const base64 = Buffer.from(bytes).toString("base64").replace(/(.{64})/gu, "$1\n");
    return {
      type: "string",
      value: `-----BEGIN ${header}-----\n${base64}\n-----END ${header}-----`
    };
  }
};

export const commentOp: Operation = {
  id: "misc.comment",
  name: "Comment",
  description: "Passes input through unchanged to annotate recipes without changing data.",
  input: ["string", "bytes", "json"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type === "string") return { type: "string", value: input.value };
    if (input.type === "bytes") return { type: "string", value: new TextDecoder().decode(input.value) };
    return { type: "string", value: JSON.stringify(input.value) };
  }
};

export const swapEndianness: Operation = {
  id: "misc.swapEndianness",
  name: "Swap Endianness",
  description: "Swaps the byte order of each fixed-width word in the input.",
  input: ["bytes", "string"],
  output: "bytes",
  args: [{ key: "wordSize", label: "Word Size", type: "number", defaultValue: 2 }],
  run: ({ input, args }) => {
    if (input.type !== "bytes" && input.type !== "string") {
      throw new Error("Expected bytes or string input");
    }
    const bytes = input.type === "bytes" ? input.value : parseHexInput(input.value);
    const wordSize = Math.max(2, Number((args.wordSize as number | undefined) ?? 2));
    if (!Number.isInteger(wordSize)) throw new Error("Word size must be an integer");
      if (bytes.length % wordSize !== 0) throw new Error("Input length must be divisible by the word size");
      const swapped = new Uint8Array(bytes.length);
      for (let offset = 0; offset < bytes.length; offset += wordSize) {
        for (let index = 0; index < wordSize; index += 1) {
          swapped[offset + index] = bytes[offset + wordSize - index - 1]!;
        }
      }
      return { type: "bytes", value: swapped };
    }
};

export const hammingDistance: Operation = {
  id: "misc.hammingDistance",
  name: "Hamming Distance",
  description: "Computes the Hamming distance between two equal-length strings.",
  input: ["string"],
  output: "string",
  args: [{ key: "other", label: "Other", type: "string", defaultValue: "" }],
  run: ({ input, args }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    const other = String((args.other as string | undefined) ?? "");
    if (input.value.length !== other.length) {
      throw new Error("Inputs must be the same length");
    }
    let distance = 0;
    for (let index = 0; index < input.value.length; index += 1) {
      if (input.value[index] !== other[index]) distance += 1;
    }
    return { type: "string", value: String(distance) };
  }
};

export const networkUrlEncode = createAliasOperation(
  "network.urlEncode",
  "URL Encode",
  "Encodes reserved characters in URLs using percent-encoding.",
  urlEncode
);
export const networkUrlDecode = createAliasOperation(
  "network.urlDecode",
  "URL Decode",
  "Decodes percent-encoded URLs back to plain text.",
  urlDecode
);
export const extractURLsAlias = createAliasOperation(
  "network.extractURLs",
  "Extract URLs",
  "Extracts unique HTTP/HTTPS URLs from text input.",
  extractUrls
);
export const parseURIAlias = createAliasOperation(
  "network.parseURI",
  "Parse URI",
  "Parses an absolute URI into normalized components.",
  parseUri
);
export const parseIPv6Alias = createAliasOperation(
  "network.parseIPv6",
  "Parse IPv6 Address",
  "Parses and normalizes an IPv6 address into compressed and expanded forms.",
  parseIPv6Address
);
export const stripTCPHeaderAlias = createAliasOperation(
  "network.stripTCPHeader",
  "Strip TCP Header",
  "Removes the TCP header and returns the payload bytes.",
  stripTcpHeader
);
export const stripUDPHeaderAlias = createAliasOperation(
  "network.stripUDPHeader",
  "Strip UDP Header",
  "Removes the UDP header and returns the payload bytes.",
  stripUdpHeader
);
export const stripHTTPHeadersAlias = createAliasOperation(
  "network.stripHTTPHeaders",
  "Strip HTTP Headers",
  "Removes HTTP headers and returns the message body bytes.",
  stripHttpHeaders
);
export const stripIPv4HeaderAlias = createAliasOperation(
  "network.stripIpHeader",
  "Strip IP Header",
  "Removes the IPv4 header and returns payload bytes.",
  stripIPv4Header
);
export const analyseUUIDAlias = createAliasOperation(
  "forensic.analyseUUID",
  "Analyse UUID",
  "Parses UUIDs and reports variant/version metadata.",
  analyseUuid
);
export const chiSquareAlias = createAliasOperation(
  "forensic.chiSquareStatistic",
  "Chi Square Statistic",
  "Calculates the chi-square statistic for byte frequency distribution.",
  chiSquareOp
);
export const generateUUIDAlias = createAliasOperation(
  "forensic.generateUUID",
  "Generate UUID",
  "Generates deterministic or random UUID values.",
  generateUuid
);
export const stringsAlias = createAliasOperation(
  "forensic.strings",
  "Strings",
  "Extracts printable strings from binary input.",
  extractStrings
);
export const miscSumAlias = createAliasOperation("misc.sum", "Sum", "Adds numeric values.", sum);
export const miscSubtractAlias = createAliasOperation(
  "misc.subtract",
  "Subtract",
  "Subtracts numeric values.",
  subtract
);
export const miscMultiplyAlias = createAliasOperation(
  "misc.multiply",
  "Multiply",
  "Multiplies numeric values.",
  multiply
);
export const miscDivideAlias = createAliasOperation(
  "misc.divide",
  "Divide",
  "Divides numeric values.",
  divide
);
export const miscEscapeStringAlias = createAliasOperation(
  "misc.escapeString",
  "Escape String",
  "Escapes control characters and quotes in strings.",
  escapeString
);
export const miscExpandAlphabetRangeAlias = createAliasOperation(
  "misc.expandAlphabetRange",
  "Expand Alphabet Range",
  "Expands alphabetic ranges into explicit character sequences.",
  expandAlphabetRange
);
export const miscAlternatingCapsAlias = createAliasOperation(
  "misc.alternatingCaps",
  "Alternating Caps",
  "Alternates character case across text.",
  alternatingCaps
);
export const miscToFloatAlias = createAliasOperation(
  "misc.toFloat",
  "To Float",
  "Encodes floating-point values into bytes.",
  toFloat
);
export const miscFromFloatAlias = createAliasOperation(
  "misc.fromFloat",
  "From Float",
  "Decodes floating-point bytes into numeric text.",
  fromFloat
);
export const atbashAlias = createAliasOperation(
  "crypto.atbash",
  "Atbash",
  "Applies the Atbash substitution cipher.",
  atbashCipher
);
export const affineEncodeAlias = createAliasOperation(
  "crypto.affineEncode",
  "Affine Encode",
  "Encodes ASCII letters using the affine cipher.",
  affineCipherEncode
);
export const affineDecodeAlias = createAliasOperation(
  "crypto.affineDecode",
  "Affine Decode",
  "Decodes ASCII letters using the affine cipher inverse.",
  affineCipherDecode
);
export const a1z26EncodeAlias = createAliasOperation(
  "crypto.a1z26Encode",
  "A1Z26 Encode",
  "Encodes ASCII letters into A1Z26 positions.",
  a1z26CipherEncode
);
export const a1z26DecodeAlias = createAliasOperation(
  "crypto.a1z26Decode",
  "A1Z26 Decode",
  "Decodes A1Z26 positions into ASCII letters.",
  a1z26CipherDecode
);
export const baconEncodeAlias = createAliasOperation(
  "crypto.baconEncode",
  "Bacon Encode",
  "Encodes ASCII letters into Bacon's cipher.",
  baconCipherEncode
);
export const baconDecodeAlias = createAliasOperation(
  "crypto.baconDecode",
  "Bacon Decode",
  "Decodes Bacon's cipher back into ASCII letters.",
  baconCipherDecode
);
export const sha1DigestAlias = createAliasOperation(
  "hash.sha1Digest",
  "SHA1 Digest",
  "Computes SHA-1 digest. Output is lowercase hex string.",
  sha1
);
export const sha224DigestAlias = createAliasOperation(
  "hash.sha224Digest",
  "SHA224 Digest",
  "Computes SHA-224 digest. Output is lowercase hex string.",
  sha224
);
export const sha256DigestAlias = createAliasOperation(
  "hash.sha256Digest",
  "SHA256 Digest",
  "Computes SHA-256 digest. Output is lowercase hex string.",
  sha256
);
export const sha384DigestAlias = createAliasOperation(
  "hash.sha384Digest",
  "SHA384 Digest",
  "Computes SHA-384 digest. Output is lowercase hex string.",
  sha384
);
export const sha512DigestAlias = createAliasOperation(
  "hash.sha512Digest",
  "SHA512 Digest",
  "Computes SHA-512 digest. Output is lowercase hex string.",
  sha512
);
export const md5DigestAlias = createAliasOperation(
  "hash.md5Digest",
  "MD5 Digest",
  "Computes MD5 digest. Output is lowercase hex string.",
  hashMd5
);
export const ripemd160DigestAlias = createAliasOperation(
  "hash.ripemd160Digest",
  "RIPEMD160 Digest",
  "Computes RIPEMD-160 digest. Output is lowercase hex string.",
  ripemd160
);
export const blake2b512Alias = createAliasOperation(
  "hash.blake2b512",
  "BLAKE2b-512",
  "Computes BLAKE2b-512 digest. Output is lowercase hex string.",
  blake2b
);
export const blake2s256Alias = createAliasOperation(
  "hash.blake2s256",
  "BLAKE2s-256",
  "Computes BLAKE2s-256 digest. Output is lowercase hex string.",
  blake2s
);
export const hmacSha1LegacyAlias = createAliasOperation(
  "crypto.hmacSha1Legacy",
  "HMAC-SHA1 Legacy",
  "Computes HMAC-SHA1 for input data and a provided key.",
  hmacSha1
);
export const hkdfLegacyAlias = createAliasOperation(
  "crypto.hkdfLegacy",
  "HKDF Legacy",
  "Derives key material using HKDF.",
  hkdf
);
export const pbkdf2LegacyAlias = createAliasOperation(
  "crypto.pbkdf2Legacy",
  "PBKDF2 Legacy",
  "Derives key material using PBKDF2.",
  pbkdf2
);
export const scryptLegacyAlias = createAliasOperation(
  "crypto.scryptLegacy",
  "scrypt Legacy",
  "Derives key material using scrypt.",
  scrypt
);

export const releaseParityAliasOps: Operation[] = [
  encodeText,
  decodeText,
  objectIdentifierToHex,
  hexToObjectIdentifier,
  pemToHex,
  hexToPem,
  networkUrlEncode,
  networkUrlDecode,
  extractURLsAlias,
  parseURIAlias,
  parseIPv6Alias,
  stripTCPHeaderAlias,
  stripUDPHeaderAlias,
  stripHTTPHeadersAlias,
  stripIPv4HeaderAlias,
  analyseUUIDAlias,
  chiSquareAlias,
  generateUUIDAlias,
  stringsAlias,
  commentOp,
  swapEndianness,
  hammingDistance,
  miscSumAlias,
  miscSubtractAlias,
  miscMultiplyAlias,
  miscDivideAlias,
  miscEscapeStringAlias,
  miscExpandAlphabetRangeAlias,
  miscAlternatingCapsAlias,
  miscToFloatAlias,
  miscFromFloatAlias,
  atbashAlias,
  affineEncodeAlias,
  affineDecodeAlias,
  a1z26EncodeAlias,
  a1z26DecodeAlias,
  baconEncodeAlias,
  baconDecodeAlias,
  sha1DigestAlias,
  sha224DigestAlias,
  sha256DigestAlias,
  sha384DigestAlias,
  sha512DigestAlias,
  md5DigestAlias,
  ripemd160DigestAlias,
  blake2b512Alias,
  blake2s256Alias,
  hmacSha1LegacyAlias,
  hkdfLegacyAlias,
  pbkdf2LegacyAlias,
  scryptLegacyAlias
];

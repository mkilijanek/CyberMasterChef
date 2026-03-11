import { intToIpv4 } from "./ipAddressUtils.js";

export type ParsedIpv4Header = {
  version: number;
  headerLengthBytes: number;
  dscp: number;
  ecn: number;
  totalLength: number;
  identification: number;
  flags: {
    reserved: boolean;
    dontFragment: boolean;
    moreFragments: boolean;
  };
  fragmentOffset: number;
  ttl: number;
  protocolNumber: number;
  protocolName: string;
  checksum: string;
  source: string;
  destination: string;
  optionsLength: number;
};

function protocolName(protocol: number): string {
  switch (protocol) {
    case 1:
      return "ICMP";
    case 6:
      return "TCP";
    case 17:
      return "UDP";
    default:
      return `UNKNOWN_${protocol}`;
  }
}

export function parseIpv4Header(bytes: Uint8Array): ParsedIpv4Header {
  if (bytes.length < 20) {
    throw new Error("IPv4 header requires at least 20 bytes");
  }
  const b0 = bytes[0] ?? 0;
  const b1 = bytes[1] ?? 0;
  const b2 = bytes[2] ?? 0;
  const b3 = bytes[3] ?? 0;
  const b4 = bytes[4] ?? 0;
  const b5 = bytes[5] ?? 0;
  const b6 = bytes[6] ?? 0;
  const b7 = bytes[7] ?? 0;
  const b8 = bytes[8] ?? 0;
  const b9 = bytes[9] ?? 0;
  const b10 = bytes[10] ?? 0;
  const b11 = bytes[11] ?? 0;
  const b12 = bytes[12] ?? 0;
  const b13 = bytes[13] ?? 0;
  const b14 = bytes[14] ?? 0;
  const b15 = bytes[15] ?? 0;
  const b16 = bytes[16] ?? 0;
  const b17 = bytes[17] ?? 0;
  const b18 = bytes[18] ?? 0;
  const b19 = bytes[19] ?? 0;

  const version = b0 >>> 4;
  const ihl = b0 & 0x0f;
  if (version !== 4) {
    throw new Error("Expected IPv4 packet");
  }
  if (ihl < 5) {
    throw new Error("Invalid IPv4 header length");
  }
  const headerLengthBytes = ihl * 4;
  if (bytes.length < headerLengthBytes) {
    throw new Error("IPv4 packet shorter than declared header length");
  }
  const totalLength = (b2 << 8) | b3;
  if (totalLength < headerLengthBytes) {
    throw new Error("IPv4 total length is smaller than header length");
  }

  const flagsAndOffset = (b6 << 8) | b7;
  const checksum = ((b10 << 8) | b11).toString(16).padStart(4, "0");
  const source = intToIpv4(((b12 << 24) | (b13 << 16) | (b14 << 8) | b15) >>> 0);
  const destination = intToIpv4(((b16 << 24) | (b17 << 16) | (b18 << 8) | b19) >>> 0);

  return {
    version,
    headerLengthBytes,
    dscp: b1 >>> 2,
    ecn: b1 & 0x03,
    totalLength,
    identification: (b4 << 8) | b5,
    flags: {
      reserved: (flagsAndOffset & 0x8000) !== 0,
      dontFragment: (flagsAndOffset & 0x4000) !== 0,
      moreFragments: (flagsAndOffset & 0x2000) !== 0
    },
    fragmentOffset: flagsAndOffset & 0x1fff,
    ttl: b8,
    protocolNumber: b9,
    protocolName: protocolName(b9),
    checksum,
    source,
    destination,
    optionsLength: headerLengthBytes - 20
  };
}

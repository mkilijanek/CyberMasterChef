export type ParsedUdpHeader = {
  sourcePort: number;
  destinationPort: number;
  length: number;
  checksum: string;
  payloadLength: number;
};

export function parseUdpHeader(bytes: Uint8Array): ParsedUdpHeader {
  if (bytes.length < 8) {
    throw new Error("UDP header requires at least 8 bytes");
  }
  const b0 = bytes[0] ?? 0;
  const b1 = bytes[1] ?? 0;
  const b2 = bytes[2] ?? 0;
  const b3 = bytes[3] ?? 0;
  const b4 = bytes[4] ?? 0;
  const b5 = bytes[5] ?? 0;
  const b6 = bytes[6] ?? 0;
  const b7 = bytes[7] ?? 0;

  const length = (b4 << 8) | b5;
  if (length !== 0 && length < 8) {
    throw new Error("Invalid UDP length");
  }

  const effectiveLength = length === 0 ? bytes.length : Math.min(length, bytes.length);
  return {
    sourcePort: (b0 << 8) | b1,
    destinationPort: (b2 << 8) | b3,
    length: length === 0 ? bytes.length : length,
    checksum: ((b6 << 8) | b7).toString(16).padStart(4, "0"),
    payloadLength: Math.max(0, effectiveLength - 8)
  };
}

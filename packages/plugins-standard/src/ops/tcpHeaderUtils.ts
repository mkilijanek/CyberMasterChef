export type ParsedTcpHeader = {
  sourcePort: number;
  destinationPort: number;
  sequenceNumber: number;
  acknowledgementNumber: number;
  headerLengthBytes: number;
  flags: {
    ns: boolean;
    cwr: boolean;
    ece: boolean;
    urg: boolean;
    ack: boolean;
    psh: boolean;
    rst: boolean;
    syn: boolean;
    fin: boolean;
  };
  windowSize: number;
  checksum: string;
  urgentPointer: number;
  optionsLength: number;
};

export function parseTcpHeader(bytes: Uint8Array): ParsedTcpHeader {
  if (bytes.length < 20) {
    throw new Error("TCP header requires at least 20 bytes");
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

  const dataOffsetWords = b12 >>> 4;
  if (dataOffsetWords < 5) {
    throw new Error("Invalid TCP header length");
  }
  const headerLengthBytes = dataOffsetWords * 4;
  if (bytes.length < headerLengthBytes) {
    throw new Error("TCP segment shorter than declared header length");
  }

  return {
    sourcePort: (b0 << 8) | b1,
    destinationPort: (b2 << 8) | b3,
    sequenceNumber: ((b4 << 24) | (b5 << 16) | (b6 << 8) | b7) >>> 0,
    acknowledgementNumber: ((b8 << 24) | (b9 << 16) | (b10 << 8) | b11) >>> 0,
    headerLengthBytes,
    flags: {
      ns: (b12 & 0x01) !== 0,
      cwr: (b13 & 0x80) !== 0,
      ece: (b13 & 0x40) !== 0,
      urg: (b13 & 0x20) !== 0,
      ack: (b13 & 0x10) !== 0,
      psh: (b13 & 0x08) !== 0,
      rst: (b13 & 0x04) !== 0,
      syn: (b13 & 0x02) !== 0,
      fin: (b13 & 0x01) !== 0
    },
    windowSize: (b14 << 8) | b15,
    checksum: ((b16 << 8) | b17).toString(16).padStart(4, "0"),
    urgentPointer: (b18 << 8) | b19,
    optionsLength: headerLengthBytes - 20
  };
}

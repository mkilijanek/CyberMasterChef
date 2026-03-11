import type { Operation } from "@cybermasterchef/core";

function parseInput(input: Uint8Array | string): Uint8Array {
  if (input instanceof Uint8Array) return input;
  const normalized = input.replace(/\s+/g, "");
  if (/^[0-9a-f]+$/i.test(normalized) && normalized.length % 2 === 0) {
    const bytes = new Uint8Array(normalized.length / 2);
    for (let index = 0; index < normalized.length; index += 2) {
      bytes[index / 2] = Number.parseInt(normalized.slice(index, index + 2), 16);
    }
    return bytes;
  }
  return new TextEncoder().encode(input);
}

function decodeContentType(value: number): string {
  switch (value) {
    case 20:
      return "change_cipher_spec";
    case 21:
      return "alert";
    case 22:
      return "handshake";
    case 23:
      return "application_data";
    case 24:
      return "heartbeat";
    default:
      return "unknown";
  }
}

function decodeVersion(major: number, minor: number): string {
  const key = `${major}.${minor}`;
  switch (key) {
    case "3.0":
      return "SSL 3.0";
    case "3.1":
      return "TLS 1.0";
    case "3.2":
      return "TLS 1.1";
    case "3.3":
      return "TLS 1.2";
    case "3.4":
      return "TLS 1.3";
    default:
      return `unknown (${major}.${minor})`;
  }
}

function decodeHandshakeType(value: number | undefined): string | null {
  switch (value) {
    case 1:
      return "client_hello";
    case 2:
      return "server_hello";
    case 11:
      return "certificate";
    case 12:
      return "server_key_exchange";
    case 13:
      return "certificate_request";
    case 14:
      return "server_hello_done";
    case 16:
      return "client_key_exchange";
    case 20:
      return "finished";
    default:
      return value === undefined ? null : "unknown";
  }
}

export const __tlsRecordInternal = {
  decodeContentType,
  decodeHandshakeType,
  decodeVersion,
  parseInput
};

export const parseTlsRecord: Operation = {
  id: "network.parseTlsRecord",
  name: "Parse TLS Record",
  description: "Parses TLS record headers and identifies handshake payload types.",
  input: ["bytes", "string"],
  output: "json",
  args: [],
  run: ({ input }) => {
    if (input.type !== "bytes" && input.type !== "string") {
      throw new Error("Expected bytes or string input");
    }
    const bytes = parseInput(input.type === "bytes" ? input.value : input.value);
    const records: Array<Record<string, unknown>> = [];
    let offset = 0;
    while (offset + 5 <= bytes.length) {
      const type = bytes[offset]!;
      const versionMajor = bytes[offset + 1]!;
      const versionMinor = bytes[offset + 2]!;
      const length = (bytes[offset + 3]! << 8) | bytes[offset + 4]!;
      if (offset + 5 + length > bytes.length) {
        throw new Error("TLS record length exceeds input size");
      }
      const payloadStart = offset + 5;
      const payload = bytes.slice(payloadStart, payloadStart + length);
      records.push({
        offset,
        contentType: decodeContentType(type),
        version: decodeVersion(versionMajor, versionMinor),
        length,
        handshakeType: type === 22 ? decodeHandshakeType(payload[0]) : null
      });
      offset += 5 + length;
    }
    if (records.length === 0) throw new Error("Expected at least one TLS record");
    return { type: "json", value: { records, trailingBytes: bytes.length - offset } };
  }
};

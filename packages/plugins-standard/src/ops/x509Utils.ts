type Asn1Node = {
  tag: number;
  constructed: boolean;
  contentStart: number;
  contentEnd: number;
};

export type ParsedX509Certificate = {
  subject: string | null;
  issuer: string | null;
  serialNumber: string | null;
  validFrom: string | null;
  validTo: string | null;
  selfIssued: boolean | null;
};

export type ParsedX509Crl = {
  issuer: string | null;
  thisUpdate: string | null;
  nextUpdate: string | null;
  revokedCertificates: number;
};

function parseAsn1Node(bytes: Uint8Array, offset: number): Asn1Node | null {
  if (offset >= bytes.length) return null;
  const tag = bytes[offset]!;
  let cursor = offset + 1;
  if (cursor >= bytes.length) return null;
  const lengthByte = bytes[cursor]!;
  cursor += 1;
  let length = 0;
  if ((lengthByte & 0x80) === 0) {
    length = lengthByte;
  } else {
    const octets = lengthByte & 0x7f;
    if (octets === 0 || octets > 4 || cursor + octets > bytes.length) return null;
    for (let index = 0; index < octets; index += 1) {
      length = (length << 8) | bytes[cursor + index]!;
    }
    cursor += octets;
  }
  const contentStart = cursor;
  const contentEnd = contentStart + length;
  if (contentEnd > bytes.length) return null;
  return { tag, constructed: (tag & 0x20) !== 0, contentStart, contentEnd };
}

function parseAsn1Children(bytes: Uint8Array, node: Asn1Node): Asn1Node[] {
  const children: Asn1Node[] = [];
  let cursor = node.contentStart;
  while (cursor < node.contentEnd) {
    const child = parseAsn1Node(bytes, cursor);
    if (child === null) return [];
    children.push(child);
    cursor = child.contentEnd;
  }
  return children;
}

function decodeOid(bytes: Uint8Array): string {
  if (bytes.length === 0) return "";
  const first = bytes[0]!;
  const parts = [Math.floor(first / 40), first % 40];
  let value = 0;
  for (let index = 1; index < bytes.length; index += 1) {
    value = (value << 7) | (bytes[index]! & 0x7f);
    if ((bytes[index]! & 0x80) === 0) {
      parts.push(value);
      value = 0;
    }
  }
  return parts.join(".");
}

function decodeAsn1String(bytes: Uint8Array, node: Asn1Node): string | null {
  const value = bytes.slice(node.contentStart, node.contentEnd);
  switch (node.tag) {
    case 0x0c:
    case 0x13:
    case 0x14:
    case 0x16:
    case 0x17:
    case 0x18:
    case 0x1a:
      return new TextDecoder().decode(value);
    case 0x1e: {
      if (value.length % 2 !== 0) return null;
      let out = "";
      for (let index = 0; index < value.length; index += 2) {
        out += String.fromCharCode((value[index]! << 8) | value[index + 1]!);
      }
      return out;
    }
    default:
      return null;
  }
}

function decodeAsn1Time(bytes: Uint8Array, node: Asn1Node): string | null {
  const raw = decodeAsn1String(bytes, node);
  if (!raw) return null;
  if (node.tag === 0x17) {
    const match = raw.match(/^(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})Z$/);
    if (!match) return null;
    const year = Number.parseInt(match[1]!, 10);
    const fullYear = year >= 50 ? 1900 + year : 2000 + year;
    return `${String(fullYear).padStart(4, "0")}-${match[2]}-${match[3]}T${match[4]}:${match[5]}:${match[6]}Z`;
  }
  if (node.tag === 0x18) {
    const match = raw.match(/^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})Z$/);
    if (!match) return null;
    return `${match[1]}-${match[2]}-${match[3]}T${match[4]}:${match[5]}:${match[6]}Z`;
  }
  return null;
}

function decodeAsn1IntegerHex(bytes: Uint8Array, node: Asn1Node): string | null {
  if (node.tag !== 0x02) return null;
  const raw = bytes.slice(node.contentStart, node.contentEnd);
  if (raw.length === 0) return null;
  const normalized = raw[0] === 0x00 ? raw.slice(1) : raw;
  return Array.from(normalized, (value) => value.toString(16).padStart(2, "0")).join("");
}

function parseX509Name(bytes: Uint8Array, node: Asn1Node): string | null {
  const labels = new Map<string, string>([
    ["2.5.4.3", "CN"],
    ["2.5.4.6", "C"],
    ["2.5.4.7", "L"],
    ["2.5.4.8", "ST"],
    ["2.5.4.10", "O"],
    ["2.5.4.11", "OU"]
  ]);
  const children = parseAsn1Children(bytes, node);
  const attrs: string[] = [];
  for (const rdn of children) {
    for (const pair of parseAsn1Children(bytes, rdn)) {
      const pairChildren = parseAsn1Children(bytes, pair);
      if (pairChildren.length < 2 || pairChildren[0]!.tag !== 0x06) continue;
      const key = labels.get(
        decodeOid(bytes.slice(pairChildren[0]!.contentStart, pairChildren[0]!.contentEnd))
      ) ?? "OID";
      const value = decodeAsn1String(bytes, pairChildren[1]!);
      if (value) attrs.push(`${key}=${value}`);
    }
  }
  return attrs.length > 0 ? attrs.join(", ") : null;
}

function decodePemBlock(input: string, label: string): Uint8Array | null {
  const match = input.match(
    new RegExp(`-----BEGIN ${label}-----([\\s\\S]+?)-----END ${label}-----`, "i")
  );
  if (!match) return null;
  const base64 = match[1]!.replace(/\s+/g, "");
  const decoded = atob(base64);
  return Uint8Array.from(decoded, (char) => char.charCodeAt(0));
}

export const __x509Internal = {
  decodeAsn1IntegerHex,
  decodeAsn1String,
  decodeAsn1Time,
  decodeOid,
  parseAsn1Children,
  parseAsn1Node,
  parseX509Name,
  parsePemBlock: decodePemBlock
};

export function parseX509Input(input: Uint8Array | string, label: string): Uint8Array {
  if (input instanceof Uint8Array) return input;
  const trimmed = input.trim();
  const pem = decodePemBlock(trimmed, label);
  if (pem) return pem;
  if (/^[0-9a-f\s]+$/i.test(trimmed) && trimmed.replace(/\s+/g, "").length % 2 === 0) {
    const normalized = trimmed.replace(/\s+/g, "");
    const bytes = new Uint8Array(normalized.length / 2);
    for (let index = 0; index < normalized.length; index += 2) {
      bytes[index / 2] = Number.parseInt(normalized.slice(index, index + 2), 16);
    }
    return bytes;
  }
  return new TextEncoder().encode(trimmed);
}

export function parseX509CertificateBytes(bytes: Uint8Array): ParsedX509Certificate {
  const root = parseAsn1Node(bytes, 0);
  if (root === null || root.tag !== 0x30) throw new Error("Invalid X.509 certificate");
  const certChildren = parseAsn1Children(bytes, root);
  if (certChildren.length < 3) throw new Error("Invalid X.509 certificate");
  const tbs = certChildren[0]!;
  const tbsChildren = parseAsn1Children(bytes, tbs);
  if (tbsChildren.length < 6) throw new Error("Invalid X.509 certificate");
  const baseIndex = tbsChildren[0]!.tag === 0xa0 ? 1 : 0;
  const serialNode = tbsChildren[baseIndex];
  const issuerNode = tbsChildren[baseIndex + 2];
  const validityNode = tbsChildren[baseIndex + 3];
  const subjectNode = tbsChildren[baseIndex + 4];
  const validityChildren = parseAsn1Children(bytes, validityNode!);
  const subject = parseX509Name(bytes, subjectNode!);
  const issuer = parseX509Name(bytes, issuerNode!);
  return {
    subject,
    issuer,
    serialNumber: decodeAsn1IntegerHex(bytes, serialNode!),
    validFrom: validityChildren[0] ? decodeAsn1Time(bytes, validityChildren[0]) : null,
    validTo: validityChildren[1] ? decodeAsn1Time(bytes, validityChildren[1]) : null,
    selfIssued: subject !== null && issuer !== null ? subject === issuer : null
  };
}

export function parseX509CrlBytes(bytes: Uint8Array): ParsedX509Crl {
  const root = parseAsn1Node(bytes, 0);
  if (root === null || root.tag !== 0x30) throw new Error("Invalid X.509 CRL");
  const crlChildren = parseAsn1Children(bytes, root);
  if (crlChildren.length < 3) throw new Error("Invalid X.509 CRL");
  const tbs = crlChildren[0]!;
  const tbsChildren = parseAsn1Children(bytes, tbs);
  const baseIndex = tbsChildren[0]!.tag === 0x02 ? 1 : 0;
  if (tbsChildren.length < baseIndex + 4) throw new Error("Invalid X.509 CRL");
  const issuerNode = tbsChildren[baseIndex + 1];
  const thisUpdateNode = tbsChildren[baseIndex + 2];
  const nextUpdateNode = tbsChildren[baseIndex + 3];
  const revokedNode = tbsChildren[baseIndex + 4];
  return {
    issuer: parseX509Name(bytes, issuerNode!),
    thisUpdate: decodeAsn1Time(bytes, thisUpdateNode!),
    nextUpdate: decodeAsn1Time(bytes, nextUpdateNode!),
    revokedCertificates:
      revokedNode && revokedNode.tag === 0x30 ? parseAsn1Children(bytes, revokedNode).length : 0
  };
}

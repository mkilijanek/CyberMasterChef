import type { Operation } from "@cybermasterchef/core";
import { bytesToHex } from "@cybermasterchef/core";
import { PRETRIAGE_HEURISTICS } from "./preTriageHeuristics.js";

type TriageSection = {
  name: string;
  virtualAddress: number;
  virtualSize: number;
  rawOffset: number;
  rawSize: number;
  entropy: number;
  characteristics: number;
};

type TriageSegment = {
  offset: number;
  size: number;
  entropy: number;
};

type TriageReport = {
  version: 1;
  input: {
    type: "bytes" | "string";
    sizeBytes: number;
    seemsBinary: boolean;
  };
  hashes: {
    sha1: string | null;
    sha256: string | null;
    sha512: string | null;
    md5: null;
    imphash: null;
    tlsh: null;
    ssdeep: null;
  };
  iocs: {
    urls: string[];
    domains: string[];
    emails: string[];
    ipv4: string[];
    ipv6: string[];
    cves: string[];
    jwt: string[];
  };
  heuristics: Array<{
    id: string;
    description: string;
    matches: string[];
  }>;
  binaryAnalysis: {
    format: "pe" | "unknown" | "text";
    sections: TriageSection[];
    segments: TriageSegment[];
    notes: string[];
  };
};

const URL_REGEX = /\bhttps?:\/\/[^\s"'<>]+/gi;
const DOMAIN_REGEX = /\b(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}\b/gi;
const EMAIL_REGEX = /\b[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}\b/gi;
const IPV4_REGEX = /\b(?:\d{1,3}\.){3}\d{1,3}\b/g;
const IPV6_REGEX = /\b(?:[a-f0-9]{1,4}:){2,7}[a-f0-9]{1,4}\b/gi;
const CVE_REGEX = /\bCVE-\d{4}-\d{4,7}\b/gi;
const JWT_REGEX = /\b[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g;

function toAscii(data: Uint8Array): string {
  let out = "";
  for (const byte of data) out += String.fromCharCode(byte);
  return out;
}

function shannonEntropy(data: Uint8Array): number {
  if (data.length === 0) return 0;
  const freq = new Uint32Array(256);
  for (const byte of data) freq[byte] = (freq[byte] ?? 0) + 1;
  let entropy = 0;
  for (const count of freq) {
    if (count === 0) continue;
    const p = count / data.length;
    entropy -= p * Math.log2(p);
  }
  return Number(entropy.toFixed(4));
}

function readU16LE(data: Uint8Array, offset: number): number {
  if (offset + 1 >= data.length) return 0;
  return data[offset]! | (data[offset + 1]! << 8);
}

function readU32LE(data: Uint8Array, offset: number): number {
  if (offset + 3 >= data.length) return 0;
  return (
    data[offset]! |
    (data[offset + 1]! << 8) |
    (data[offset + 2]! << 16) |
    (data[offset + 3]! << 24 >>> 0)
  ) >>> 0;
}

function parsePeSections(data: Uint8Array): TriageSection[] {
  if (data.length < 0x100) return [];
  if (data[0] !== 0x4d || data[1] !== 0x5a) return [];
  const peOffset = readU32LE(data, 0x3c);
  if (peOffset <= 0 || peOffset + 24 >= data.length) return [];
  if (
    data[peOffset] !== 0x50 ||
    data[peOffset + 1] !== 0x45 ||
    data[peOffset + 2] !== 0x00 ||
    data[peOffset + 3] !== 0x00
  ) {
    return [];
  }

  const sectionCount = readU16LE(data, peOffset + 6);
  const sizeOptionalHeader = readU16LE(data, peOffset + 20);
  const sectionTableOffset = peOffset + 24 + sizeOptionalHeader;
  const sections: TriageSection[] = [];

  for (let i = 0; i < sectionCount; i++) {
    const base = sectionTableOffset + i * 40;
    if (base + 39 >= data.length) break;
    const nameBytes = data.slice(base, base + 8);
    const name = toAscii(nameBytes).replace(/\u0000+$/g, "").trim() || `section_${i}`;
    const virtualSize = readU32LE(data, base + 8);
    const virtualAddress = readU32LE(data, base + 12);
    const rawSize = readU32LE(data, base + 16);
    const rawOffset = readU32LE(data, base + 20);
    const characteristics = readU32LE(data, base + 36);
    const rawSlice =
      rawOffset + rawSize <= data.length ? data.slice(rawOffset, rawOffset + rawSize) : new Uint8Array();
    sections.push({
      name,
      virtualAddress,
      virtualSize,
      rawOffset,
      rawSize,
      entropy: shannonEntropy(rawSlice),
      characteristics
    });
  }

  return sections;
}

function buildSegments(data: Uint8Array, windowSize: number, limit: number): TriageSegment[] {
  const out: TriageSegment[] = [];
  for (let offset = 0; offset < data.length && out.length < limit; offset += windowSize) {
    const size = Math.min(windowSize, data.length - offset);
    const slice = data.slice(offset, offset + size);
    out.push({
      offset,
      size,
      entropy: shannonEntropy(slice)
    });
  }
  return out;
}

function uniqueMatches(input: string, pattern: RegExp, normalize: (value: string) => string, limit: number): string[] {
  const set = new Set<string>();
  const flags = pattern.flags.includes("g") ? pattern.flags : `${pattern.flags}g`;
  const safePattern = new RegExp(pattern.source, flags);
  for (const match of input.matchAll(safePattern)) {
    const raw = match[0];
    if (raw === undefined) continue;
    set.add(normalize(raw));
    if (set.size >= limit) break;
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

function validIpv4(candidate: string): boolean {
  const octets = candidate.split(".");
  if (octets.length !== 4) return false;
  for (const octet of octets) {
    const value = Number(octet);
    if (!Number.isInteger(value) || value < 0 || value > 255) return false;
  }
  return true;
}

async function digestHex(data: Uint8Array, algorithm: "SHA-1" | "SHA-256" | "SHA-512"): Promise<string | null> {
  const subtle = globalThis.crypto?.subtle;
  if (!subtle) return null;
  try {
    const out = await subtle.digest(algorithm, Uint8Array.from(data));
    return bytesToHex(new Uint8Array(out));
  } catch {
    return null;
  }
}

export const basicPreTriage: Operation = {
  id: "forensic.basicPreTriage",
  name: "Basic Pre-Triage",
  description:
    "Generates a baseline forensic pre-triage report (IOCs, hashes, binary structure and entropy).",
  input: ["bytes", "string"],
  output: "string",
  args: [
    {
      key: "maxMatches",
      label: "Max matches per IOC type",
      type: "number",
      defaultValue: 200
    },
    {
      key: "segmentWindow",
      label: "Entropy segment size (bytes)",
      type: "number",
      defaultValue: 4096
    },
    {
      key: "segmentLimit",
      label: "Max entropy segments",
      type: "number",
      defaultValue: 16
    },
    {
      key: "maxHeuristicMatches",
      label: "Max heuristic matches",
      type: "number",
      defaultValue: 25
    }
  ],
  run: async ({ input, args }) => {
    const maxMatchesArg = typeof args.maxMatches === "number" ? args.maxMatches : 200;
    const maxMatches = Math.max(10, Math.min(2000, Math.floor(maxMatchesArg)));
    const segmentWindowArg = typeof args.segmentWindow === "number" ? args.segmentWindow : 4096;
    const segmentWindow = Math.max(256, Math.min(65536, Math.floor(segmentWindowArg)));
    const segmentLimitArg = typeof args.segmentLimit === "number" ? args.segmentLimit : 16;
    const segmentLimit = Math.max(1, Math.min(256, Math.floor(segmentLimitArg)));
    const maxHeuristicMatchesArg =
      typeof args.maxHeuristicMatches === "number" ? args.maxHeuristicMatches : 25;
    const maxHeuristicMatches = Math.max(1, Math.min(500, Math.floor(maxHeuristicMatchesArg)));

    if (input.type !== "bytes" && input.type !== "string") {
      throw new Error("Expected bytes or string input");
    }

    const data = input.type === "bytes" ? input.value : new TextEncoder().encode(input.value);
    const text = input.type === "bytes" ? toAscii(input.value) : input.value;
    const seemsBinary = input.type === "bytes";

    const urls = uniqueMatches(text, URL_REGEX, (v) => v.replace(/[),.;:!?]+$/g, ""), maxMatches);
    const domains = uniqueMatches(text, DOMAIN_REGEX, (v) => v.toLowerCase(), maxMatches);
    const emails = uniqueMatches(text, EMAIL_REGEX, (v) => v.toLowerCase(), maxMatches);
    const ipv4 = uniqueMatches(text, IPV4_REGEX, (v) => v, maxMatches).filter((v) => validIpv4(v));
    const ipv6 = uniqueMatches(text, IPV6_REGEX, (v) => v.toLowerCase(), maxMatches);
    const cves = uniqueMatches(text, CVE_REGEX, (v) => v.toUpperCase(), maxMatches);
    const jwt = uniqueMatches(text, JWT_REGEX, (v) => v, maxMatches);
    const heuristics = PRETRIAGE_HEURISTICS.map((h) => ({
      id: h.id,
      description: h.description,
      matches: uniqueMatches(text, h.pattern, (v) => v, maxHeuristicMatches)
    })).filter((h) => h.matches.length > 0);

    const sections = seemsBinary ? parsePeSections(data) : [];
    const format: "pe" | "unknown" | "text" = !seemsBinary ? "text" : sections.length > 0 ? "pe" : "unknown";
    const notes: string[] = [];
    notes.push("md5/imphash/TLSH/ssdeep are placeholders in this baseline and return null.");
    if (seemsBinary && sections.length === 0) {
      notes.push("PE section table not detected; generic entropy segments provided.");
    }

    const report: TriageReport = {
      version: 1,
      input: {
        type: input.type,
        sizeBytes: data.length,
        seemsBinary
      },
      hashes: {
        sha1: await digestHex(data, "SHA-1"),
        sha256: await digestHex(data, "SHA-256"),
        sha512: await digestHex(data, "SHA-512"),
        md5: null,
        imphash: null,
        tlsh: null,
        ssdeep: null
      },
      iocs: {
        urls,
        domains,
        emails,
        ipv4,
        ipv6,
        cves,
        jwt
      },
      heuristics,
      binaryAnalysis: {
        format,
        sections,
        segments: buildSegments(data, segmentWindow, segmentLimit),
        notes
      }
    };

    return { type: "string", value: JSON.stringify(report, null, 2) };
  }
};

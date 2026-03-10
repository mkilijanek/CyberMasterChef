import { bytesToBase64 } from "@cybermasterchef/core";
import type { DataValue, Operation } from "@cybermasterchef/core";
import { basicPreTriage } from "./basicPreTriage.js";

type PreTriageReport = {
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
    format: "pe" | "elf" | "macho" | "unknown" | "text";
    sections: Array<{ entropy: number }>;
  };
  trustAnalysis: {
    status: "not_applicable" | "unsigned" | "signed" | "invalid";
    source: "none" | "raw_x509" | "pkcs7";
    certificateCount: number;
    subject: string | null;
    issuer: string | null;
    serialNumber: string | null;
    validFrom: string | null;
    validTo: string | null;
    selfIssued: boolean | null;
    notes: string[];
  };
  hashes: {
    sha1: string | null;
    sha256: string | null;
    sha512: string | null;
    md5: string | null;
    imphash: string | null;
    tlsh: string | null;
    ssdeep: string | null;
  };
};

type TriageFinding = {
  id: string;
  severity: "low" | "medium" | "high";
  description: string;
};

type DerivedIndicator = {
  kind: "url" | "domain-name" | "ipv4-addr" | "ipv6-addr" | "email-addr" | "vulnerability";
  value: string;
  sourcePath:
    | "preTriage.iocs.urls"
    | "preTriage.iocs.domains"
    | "preTriage.iocs.ipv4"
    | "preTriage.iocs.ipv6"
    | "preTriage.iocs.emails"
    | "preTriage.iocs.cves";
  mispType: string;
  mispCategory: string;
  pattern: string;
};

type IndicatorProvenance = {
  id: string;
  kind: DerivedIndicator["kind"];
  value: string;
  sourcePath: DerivedIndicator["sourcePath"];
  exports: {
    stixIndicatorId: string;
    mispAttribute: {
      type: string;
      category: string;
      value: string;
    };
  };
};

type AdapterSubmissionProvenance = {
  adapter: "sandbox" | "zipPasswordPipeline" | "yara";
  attempted: boolean;
  status: "disabled" | "skipped" | "submitted" | "failed";
  endpoint: string | null;
  responseCode: number | null;
  error: string | null;
  requestSummary: Record<string, unknown>;
  responseSummary: Record<string, unknown>;
};

type TriageReport = {
  version: 1;
  score: {
    riskScoreNorm: number;
    verdict: "benign" | "suspicious" | "malicious";
    reasons: string[];
  };
  findings: TriageFinding[];
  mockedCapabilities: string[];
  exports: {
    stixBundle: {
      type: "bundle";
      id: string;
      objects: Array<Record<string, unknown>>;
    };
    mispEvent: {
      Event: {
        info: string;
        date: string;
        Attribute: Array<{ type: string; category: string; value: string }>;
      };
    };
  };
  recommendations: string[];
  provenance: {
    derivedIndicators: IndicatorProvenance[];
    adapterSubmissions: AdapterSubmissionProvenance[];
  };
  evidenceBundle: {
    schemaVersion: 1;
    generatedAt: string;
    bundleId: string;
    sample: {
      inputType: DataValue["type"];
      sizeBytes: number;
      sha256: string | null;
      md5: string | null;
    };
    score: TriageReport["score"];
    findingIds: string[];
    recommendationCount: number;
    exportSummary: {
      stixObjectCount: number;
      mispAttributeCount: number;
    };
    archiveSummary: {
      format: "zip" | "none";
      entryCount: number;
      encryptedEntries: number;
      safeToSubmit: boolean;
      guardReasons: string[];
    };
    provenance: TriageReport["provenance"];
  };
  integrations: {
    sandbox: {
      enabled: boolean;
      runtimeProfile: "disabled" | "cli";
      attempted: boolean;
      status: "disabled" | "skipped" | "submitted" | "failed";
      endpoint: string | null;
      responseCode: number | null;
      submissionId: string | null;
      error: string | null;
    };
    zipPasswordPipeline: {
      enabled: boolean;
      runtimeProfile: "disabled" | "cli";
      attempted: boolean;
      status: "disabled" | "skipped" | "submitted" | "failed";
      endpoint: string | null;
      responseCode: number | null;
      candidateCount: number;
      matchedPassword: string | null;
      error: string | null;
    };
    yara: {
      enabled: boolean;
      runtimeProfile: "disabled" | "cli";
      attempted: boolean;
      status: "disabled" | "skipped" | "submitted" | "failed";
      endpoint: string | null;
      responseCode: number | null;
      matchCount: number;
      ruleMatches: string[];
      error: string | null;
    };
  };
  archiveAnalysis: {
    format: "zip" | "none";
    entryCount: number;
    totalCompressedBytes: number;
    totalUncompressedBytes: number;
    encryptedEntries: number;
    maxCompressionRatio: number;
    suspiciousPaths: string[];
    entries: Array<{
      name: string;
      normalizedPath: string | null;
      isDirectory: boolean;
      compressedBytes: number;
      uncompressedBytes: number;
      encrypted: boolean;
      crc32Hex: string;
      suspiciousPath: boolean;
    }>;
    guards: {
      pathTraversalSafe: boolean;
      withinEntryLimit: boolean;
      withinExpandedBytesLimit: boolean;
      withinCompressionRatioLimit: boolean;
      enforced: boolean;
      safeToSubmit: boolean;
      reasons: string[];
    };
  };
  preTriage: PreTriageReport;
};

type SandboxIntegration = TriageReport["integrations"]["sandbox"];
type ZipIntegration = TriageReport["integrations"]["zipPasswordPipeline"];
type YaraIntegration = TriageReport["integrations"]["yara"];

const MOCKED_CAPABILITIES_BASE = [
  "archive_password_handling_and_zip_unpacking",
  "zip_slip_and_zip_bomb_safe_unpack_guards",
  "pe_imphash",
  "tlsh_fuzzy_hash",
  "ssdeep_fuzzy_hash",
  "yara_or_yara_x_rule_scanning",
  "authenticode_or_x509_verification",
  "dynamic_sandbox_integration_cuckoo"
] as const;

const DETERMINISTIC_ISO_TIMESTAMP = "1970-01-01T00:00:00.000Z";

function stableId(prefix: string, value: string): string {
  let hash = 2166136261;
  const input = `${prefix}:${value}`;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  return `${prefix}--${hash.toString(16).padStart(8, "0")}`;
}

function collectDerivedIndicators(pre: PreTriageReport): DerivedIndicator[] {
  const indicators: DerivedIndicator[] = [];
  for (const value of pre.iocs.urls) {
    indicators.push({
      kind: "url",
      value,
      sourcePath: "preTriage.iocs.urls",
      mispType: "url",
      mispCategory: "Network activity",
      pattern: `[url:value = '${value}']`
    });
  }
  for (const value of pre.iocs.domains) {
    indicators.push({
      kind: "domain-name",
      value,
      sourcePath: "preTriage.iocs.domains",
      mispType: "domain",
      mispCategory: "Network activity",
      pattern: `[domain-name:value = '${value}']`
    });
  }
  for (const value of pre.iocs.ipv4) {
    indicators.push({
      kind: "ipv4-addr",
      value,
      sourcePath: "preTriage.iocs.ipv4",
      mispType: "ip-dst",
      mispCategory: "Network activity",
      pattern: `[ipv4-addr:value = '${value}']`
    });
  }
  for (const value of pre.iocs.ipv6) {
    indicators.push({
      kind: "ipv6-addr",
      value,
      sourcePath: "preTriage.iocs.ipv6",
      mispType: "ip-dst",
      mispCategory: "Network activity",
      pattern: `[ipv6-addr:value = '${value}']`
    });
  }
  for (const value of pre.iocs.emails) {
    indicators.push({
      kind: "email-addr",
      value,
      sourcePath: "preTriage.iocs.emails",
      mispType: "email-src",
      mispCategory: "Payload delivery",
      pattern: `[email-addr:value = '${value}']`
    });
  }
  for (const value of pre.iocs.cves) {
    indicators.push({
      kind: "vulnerability",
      value,
      sourcePath: "preTriage.iocs.cves",
      mispType: "vulnerability",
      mispCategory: "External analysis",
      pattern: `[vulnerability:name = '${value}']`
    });
  }
  return indicators;
}

function toStixIndicators(pre: PreTriageReport): Array<Record<string, unknown>> {
  const objects: Array<Record<string, unknown>> = [];
  for (const entry of collectDerivedIndicators(pre)) {
    objects.push({
      type: "indicator",
      spec_version: "2.1",
      id: stableId("indicator", `${entry.kind}:${entry.value}`),
      created: DETERMINISTIC_ISO_TIMESTAMP,
      modified: DETERMINISTIC_ISO_TIMESTAMP,
      name: `${entry.kind}:${entry.value}`,
      pattern_type: "stix",
      pattern: entry.pattern,
      valid_from: DETERMINISTIC_ISO_TIMESTAMP,
      labels: ["malicious-activity"]
    });
  }
  return objects;
}

function toMispAttributes(pre: PreTriageReport): Array<{ type: string; category: string; value: string }> {
  return collectDerivedIndicators(pre).map((entry) => ({
    type: entry.mispType,
    category: entry.mispCategory,
    value: entry.value
  }));
}

function clampScore(input: number): number {
  if (input < 0) return 0;
  if (input > 100) return 100;
  return Math.round(input);
}

function toVerdict(
  score: number,
  suspiciousThreshold: number,
  maliciousThreshold: number
): "benign" | "suspicious" | "malicious" {
  if (score >= maliciousThreshold) return "malicious";
  if (score >= suspiciousThreshold) return "suspicious";
  return "benign";
}

function computeMockedCapabilities(pre: PreTriageReport): string[] {
  return Array.from(MOCKED_CAPABILITIES_BASE).filter((capability) => {
    if (capability === "pe_imphash") return pre.hashes.imphash === null;
    if (capability === "tlsh_fuzzy_hash") return pre.hashes.tlsh === null;
    if (capability === "ssdeep_fuzzy_hash") return pre.hashes.ssdeep === null;
    if (capability === "authenticode_or_x509_verification") {
      return !(pre.binaryAnalysis.format === "pe" && pre.trustAnalysis.status !== "not_applicable");
    }
    return true;
  });
}

function parseAllowedHosts(raw: unknown): string[] {
  if (typeof raw !== "string") return [];
  return raw
    .split(",")
    .map((v) => v.trim().toLowerCase())
    .filter((v) => v.length > 0);
}

function validateEndpoint(label: string, endpoint: string, allowedHosts: string[]): URL {
  let parsed: URL;
  try {
    parsed = new URL(endpoint);
  } catch {
    throw new Error(`${label} endpoint must be a valid absolute URL`);
  }
  const host = parsed.hostname.toLowerCase();
  const isLoopback = host === "localhost" || host === "127.0.0.1" || host === "::1";
  const isHttps = parsed.protocol === "https:";
  if (!isHttps && !isLoopback) {
    throw new Error(`${label} endpoint must use https (http is only allowed for loopback)`);
  }
  if (allowedHosts.length > 0 && !allowedHosts.includes(host)) {
    throw new Error(`${label} endpoint host not allowlisted: ${host}`);
  }
  return parsed;
}

async function submitJsonWithRetry(args: {
  endpoint: URL;
  timeoutMs: number;
  retries: number;
  payload: Record<string, unknown>;
  errorPrefix: string;
  validateBody?: (body: Record<string, unknown> | null) => string | null;
}): Promise<{
  status: "submitted" | "failed";
  responseCode: number | null;
  body: Record<string, unknown> | null;
  error: string | null;
}> {
  const fetchFn = globalThis.fetch;
  if (typeof fetchFn !== "function") {
    return {
      status: "failed",
      responseCode: null,
      body: null,
      error: "fetch is not available in this runtime"
    };
  }

  let lastError: string | null = null;
  let lastStatus: number | null = null;
  for (let attempt = 0; attempt <= args.retries; attempt++) {
    const abortCtrl = new AbortController();
    const timer = setTimeout(() => abortCtrl.abort(), args.timeoutMs);
    try {
      const response = await fetchFn(args.endpoint.toString(), {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(args.payload),
        signal: abortCtrl.signal
      });
      clearTimeout(timer);
      lastStatus = response.status;
      if (!response.ok) {
        lastError = `${args.errorPrefix}_http_${response.status}`;
      } else {
        let body: Record<string, unknown> | null = null;
        try {
          body = (await response.json()) as Record<string, unknown>;
        } catch {
          body = null;
        }
        const validationError = args.validateBody?.(body) ?? null;
        if (validationError !== null) {
          lastError = validationError;
          continue;
        }
        return {
          status: "submitted",
          responseCode: response.status,
          body,
          error: null
        };
      }
    } catch (error) {
      clearTimeout(timer);
      lastError = error instanceof Error ? error.message : String(error);
    }
    if (attempt < args.retries) {
      await new Promise((resolve) => setTimeout(resolve, Math.min(1000, 150 * (attempt + 1))));
    }
  }
  return {
    status: "failed",
    responseCode: lastStatus,
    body: null,
    error: lastError
  };
}

function buildFindings(pre: PreTriageReport): { findings: TriageFinding[]; reasons: string[]; score: number } {
  const findings: TriageFinding[] = [];
  const reasons: string[] = [];
  let score = 0;

  if (pre.heuristics.length > 0) {
    const matched = pre.heuristics.reduce((acc, h) => acc + h.matches.length, 0);
    const delta = Math.min(30, matched * 2);
    score += delta;
    reasons.push(`heuristic_matches:${matched}`);
    findings.push({
      id: "heuristic-matches",
      severity: matched >= 10 ? "high" : "medium",
      description: `Matched ${matched} pre-triage heuristic indicators.`
    });
  }

  const iocCount =
    pre.iocs.urls.length +
    pre.iocs.domains.length +
    pre.iocs.emails.length +
    pre.iocs.ipv4.length +
    pre.iocs.ipv6.length +
    pre.iocs.cves.length +
    pre.iocs.jwt.length;

  if (iocCount > 0) {
    const delta = Math.min(25, Math.floor(iocCount * 1.5));
    score += delta;
    reasons.push(`ioc_count:${iocCount}`);
    findings.push({
      id: "ioc-density",
      severity: iocCount >= 10 ? "high" : "medium",
      description: `Extracted ${iocCount} IOC entries from sample.`
    });
  }

  if (pre.iocs.cves.length > 0) {
    score += 15;
    reasons.push(`cve_refs:${pre.iocs.cves.length}`);
    findings.push({
      id: "cve-reference",
      severity: "high",
      description: "Found CVE references in sample content."
    });
  }

  if (pre.iocs.jwt.length > 0) {
    score += 8;
    reasons.push(`jwt_tokens:${pre.iocs.jwt.length}`);
    findings.push({
      id: "jwt-artifact",
      severity: "medium",
      description: "Found JWT-like tokens in sample content."
    });
  }

  const highEntropySections = pre.binaryAnalysis.sections.filter((s) => s.entropy >= 7.2);
  if (highEntropySections.length > 0) {
    score += 15;
    reasons.push(`high_entropy_sections:${highEntropySections.length}`);
    findings.push({
      id: "high-entropy-sections",
      severity: "medium",
      description: `Detected ${highEntropySections.length} high-entropy binary sections.`
    });
  }

  if (pre.hashes.imphash !== null) {
    score += 6;
    reasons.push("imphash_present");
    findings.push({
      id: "imphash-available",
      severity: "medium",
      description: "Computed PE import hash (imphash) for this sample."
    });
  }

  if (pre.hashes.tlsh !== null || pre.hashes.ssdeep !== null) {
    score += 4;
    reasons.push("fuzzy_hash_present");
    findings.push({
      id: "fuzzy-hash-available",
      severity: "low",
      description: "Computed fuzzy hash fingerprints (TLSH/ssdeep) for this sample."
    });
  }

  if (pre.binaryAnalysis.format === "pe" && pre.trustAnalysis.status === "unsigned") {
    score += 4;
    reasons.push("pe_unsigned");
    findings.push({
      id: "pe-unsigned",
      severity: "medium",
      description: "PE sample has no embedded Authenticode / X.509 certificate table."
    });
  }

  if (pre.trustAnalysis.status === "signed") {
    reasons.push("pe_signed");
    findings.push({
      id: "embedded-certificate",
      severity: "low",
      description: `Parsed embedded certificate for subject ${pre.trustAnalysis.subject ?? "unknown"}.`
    });
  }

  return { findings, reasons, score: clampScore(score) };
}

function toInputBytes(input: DataValue): Uint8Array {
  if (input.type === "bytes") return input.value;
  if (input.type === "string") return new TextEncoder().encode(input.value);
  throw new Error(`Unsupported input type: ${input.type}`);
}

function hasSubmissionId(body: Record<string, unknown> | null): body is Record<string, unknown> {
  if (body === null) return false;
  return typeof body.submissionId === "string" || typeof body.id === "string";
}

function hasZipPipelineResult(body: Record<string, unknown> | null): body is Record<string, unknown> {
  if (body === null) return false;
  return typeof body.matchedPassword === "string" || typeof body.password === "string";
}

function hasYaraResult(body: Record<string, unknown> | null): body is Record<string, unknown> {
  if (body === null) return false;
  return Array.isArray(body.ruleMatches) && body.ruleMatches.every((value) => typeof value === "string");
}

function readU16LE(bytes: Uint8Array, offset: number): number {
  return bytes[offset]! | (bytes[offset + 1]! << 8);
}

function readU32LE(bytes: Uint8Array, offset: number): number {
  return (
    bytes[offset]! |
    (bytes[offset + 1]! << 8) |
    (bytes[offset + 2]! << 16) |
    (bytes[offset + 3]! << 24)
  ) >>> 0;
}

function normalizeZipEntryPath(name: string): string | null {
  const unified = name.replaceAll("\\", "/");
  if (
    unified.startsWith("/") ||
    /^[a-zA-Z]:/.test(unified) ||
    unified.includes("\u0000") ||
    unified.split("/").some((segment) => segment === "..")
  ) {
    return null;
  }
  const normalized = unified
    .split("/")
    .filter((segment) => segment.length > 0 && segment !== ".")
    .join("/");
  return normalized;
}

function inspectZipArchive(args: {
  bytes: Uint8Array;
  maxEntries: number;
  maxExpandedBytes: number;
  maxCompressionRatio: number;
}): TriageReport["archiveAnalysis"] {
  const entries: TriageReport["archiveAnalysis"]["entries"] = [];
  let offset = 0;

  while (offset + 4 <= args.bytes.length) {
    const signature = readU32LE(args.bytes, offset);
    if (signature === 0x04034b50) {
      if (offset + 30 > args.bytes.length) break;
      const flags = readU16LE(args.bytes, offset + 6);
      const compressedBytes = readU32LE(args.bytes, offset + 18);
      const uncompressedBytes = readU32LE(args.bytes, offset + 22);
      const fileNameLength = readU16LE(args.bytes, offset + 26);
      const extraLength = readU16LE(args.bytes, offset + 28);
      const nameStart = offset + 30;
      const nameEnd = nameStart + fileNameLength;
      const dataStart = nameEnd + extraLength;
      const dataEnd = dataStart + compressedBytes;
      if (dataEnd > args.bytes.length) break;
      const name = new TextDecoder().decode(args.bytes.slice(nameStart, nameEnd));
      const normalizedPath = normalizeZipEntryPath(name);
      const suspiciousPath = normalizedPath === null;
      entries.push({
        name,
        normalizedPath,
        isDirectory: name.endsWith("/"),
        compressedBytes,
        uncompressedBytes,
        encrypted: (flags & 0x1) !== 0,
        crc32Hex: readU32LE(args.bytes, offset + 14).toString(16).padStart(8, "0"),
        suspiciousPath
      });
      offset = dataEnd;
      continue;
    }
    if (signature === 0x02014b50 || signature === 0x06054b50) break;
    break;
  }

  const suspiciousPaths = entries.filter((entry) => entry.suspiciousPath).map((entry) => entry.name);
  const totalCompressedBytes = entries.reduce((acc, entry) => acc + entry.compressedBytes, 0);
  const totalUncompressedBytes = entries.reduce((acc, entry) => acc + entry.uncompressedBytes, 0);
  const maxCompressionRatio = entries.reduce((acc, entry) => {
    const ratio =
      entry.compressedBytes === 0
        ? entry.uncompressedBytes > 0
          ? Number.POSITIVE_INFINITY
          : 1
        : entry.uncompressedBytes / entry.compressedBytes;
    return Math.max(acc, ratio);
  }, 1);
  const reasons: string[] = [];
  const pathTraversalSafe = suspiciousPaths.length === 0;
  if (!pathTraversalSafe) reasons.push("zip_path_traversal_detected");
  const withinEntryLimit = entries.length <= args.maxEntries;
  if (!withinEntryLimit) reasons.push(`zip_entry_limit_exceeded:${entries.length}`);
  const withinExpandedBytesLimit = totalUncompressedBytes <= args.maxExpandedBytes;
  if (!withinExpandedBytesLimit) {
    reasons.push(`zip_expanded_bytes_limit_exceeded:${totalUncompressedBytes}`);
  }
  const withinCompressionRatioLimit = maxCompressionRatio <= args.maxCompressionRatio;
  if (!withinCompressionRatioLimit) {
    reasons.push(`zip_compression_ratio_limit_exceeded:${maxCompressionRatio.toFixed(2)}`);
  }
  if (entries.length === 0) reasons.push("zip_entries_unavailable");
  const safeToSubmit =
    entries.length > 0 &&
    pathTraversalSafe &&
    withinEntryLimit &&
    withinExpandedBytesLimit &&
    withinCompressionRatioLimit;

  return {
    format: entries.length > 0 ? "zip" : "none",
    entryCount: entries.length,
    totalCompressedBytes,
    totalUncompressedBytes,
    encryptedEntries: entries.filter((entry) => entry.encrypted).length,
    maxCompressionRatio: Number(maxCompressionRatio.toFixed(3)),
    suspiciousPaths,
    entries,
    guards: {
      pathTraversalSafe,
      withinEntryLimit,
      withinExpandedBytesLimit,
      withinCompressionRatioLimit,
      enforced: entries.length > 0,
      safeToSubmit,
      reasons
    }
  };
}

function buildIndicatorProvenance(pre: PreTriageReport): IndicatorProvenance[] {
  return collectDerivedIndicators(pre).map((entry) => ({
    id: stableId("derived-indicator", `${entry.kind}:${entry.value}`),
    kind: entry.kind,
    value: entry.value,
    sourcePath: entry.sourcePath,
    exports: {
      stixIndicatorId: stableId("indicator", `${entry.kind}:${entry.value}`),
      mispAttribute: {
        type: entry.mispType,
        category: entry.mispCategory,
        value: entry.value
      }
    }
  }));
}

export const basicTriage: Operation = {
  id: "forensic.basicTriage",
  name: "Basic Triage",
  description:
    "Builds triage verdict and risk score on top of forensic.basicPreTriage report.",
  input: ["bytes", "string"],
  output: "string",
  args: [
    {
      key: "suspiciousThreshold",
      label: "Suspicious threshold",
      type: "number",
      defaultValue: 30
    },
    {
      key: "maliciousThreshold",
      label: "Malicious threshold",
      type: "number",
      defaultValue: 60
    },
    {
      key: "enableSandboxSubmit",
      label: "Enable sandbox submit",
      type: "boolean",
      defaultValue: false
    },
    {
      key: "sandboxRuntimeProfile",
      label: "Sandbox runtime profile",
      type: "select",
      defaultValue: "disabled",
      options: [
        { label: "Disabled", value: "disabled" },
        { label: "CLI", value: "cli" }
      ]
    },
    {
      key: "sandboxEndpoint",
      label: "Sandbox endpoint URL",
      type: "string",
      defaultValue: ""
    },
    {
      key: "sandboxAllowHosts",
      label: "Allowlisted sandbox hosts",
      type: "string",
      defaultValue: "localhost,127.0.0.1"
    },
    {
      key: "sandboxTimeoutMs",
      label: "Sandbox timeout ms",
      type: "number",
      defaultValue: 5000
    },
    {
      key: "sandboxRetries",
      label: "Sandbox retries",
      type: "number",
      defaultValue: 2
    },
    {
      key: "enableZipPasswordPipeline",
      label: "Enable ZIP password pipeline",
      type: "boolean",
      defaultValue: false
    },
    {
      key: "zipRuntimeProfile",
      label: "ZIP runtime profile",
      type: "select",
      defaultValue: "disabled",
      options: [
        { label: "Disabled", value: "disabled" },
        { label: "CLI", value: "cli" }
      ]
    },
    {
      key: "zipEndpoint",
      label: "ZIP endpoint URL",
      type: "string",
      defaultValue: ""
    },
    {
      key: "zipAllowHosts",
      label: "Allowlisted ZIP hosts",
      type: "string",
      defaultValue: "localhost,127.0.0.1"
    },
    {
      key: "zipTimeoutMs",
      label: "ZIP timeout ms",
      type: "number",
      defaultValue: 5000
    },
    {
      key: "zipRetries",
      label: "ZIP retries",
      type: "number",
      defaultValue: 2
    },
    {
      key: "zipCandidatePasswords",
      label: "ZIP candidate passwords",
      type: "string",
      defaultValue: ""
    },
    {
      key: "zipMaxInputBytes",
      label: "ZIP max input bytes",
      type: "number",
      defaultValue: 10485760
    },
    {
      key: "zipMaxExpandedBytes",
      label: "ZIP max expanded bytes",
      type: "number",
      defaultValue: 52428800
    },
    {
      key: "zipMaxEntries",
      label: "ZIP max entries",
      type: "number",
      defaultValue: 1024
    },
    {
      key: "zipMaxCompressionRatio",
      label: "ZIP max compression ratio",
      type: "number",
      defaultValue: 250
    },
    {
      key: "enableYaraScan",
      label: "Enable YARA scan",
      type: "boolean",
      defaultValue: false
    },
    {
      key: "yaraRuntimeProfile",
      label: "YARA runtime profile",
      type: "select",
      defaultValue: "disabled",
      options: [
        { label: "Disabled", value: "disabled" },
        { label: "CLI", value: "cli" }
      ]
    },
    {
      key: "yaraEndpoint",
      label: "YARA endpoint URL",
      type: "string",
      defaultValue: ""
    },
    {
      key: "yaraAllowHosts",
      label: "Allowlisted YARA hosts",
      type: "string",
      defaultValue: "localhost,127.0.0.1"
    },
    {
      key: "yaraTimeoutMs",
      label: "YARA timeout ms",
      type: "number",
      defaultValue: 5000
    },
    {
      key: "yaraRetries",
      label: "YARA retries",
      type: "number",
      defaultValue: 2
    },
    {
      key: "yaraProfile",
      label: "YARA profile",
      type: "string",
      defaultValue: "default"
    }
  ],
  run: async ({ input, args, signal }) => {
    const inputBytes = toInputBytes(input);
    const inputBase64 = bytesToBase64(inputBytes);
    const suspiciousThresholdArg =
      typeof args.suspiciousThreshold === "number" ? args.suspiciousThreshold : 30;
    const maliciousThresholdArg =
      typeof args.maliciousThreshold === "number" ? args.maliciousThreshold : 60;
    const suspiciousThreshold = Math.max(1, Math.min(99, Math.floor(suspiciousThresholdArg)));
    const maliciousThreshold = Math.max(
      suspiciousThreshold,
      Math.min(100, Math.floor(maliciousThresholdArg))
    );
    const sandboxProfile =
      args.sandboxRuntimeProfile === "cli" || args.sandboxRuntimeProfile === "disabled"
        ? args.sandboxRuntimeProfile
        : "disabled";
    const sandboxEnabled = args.enableSandboxSubmit === true && sandboxProfile === "cli";
    const sandboxEndpointRaw = typeof args.sandboxEndpoint === "string" ? args.sandboxEndpoint.trim() : "";
    const sandboxTimeoutMs = Math.max(
      100,
      Math.min(60000, Math.floor(typeof args.sandboxTimeoutMs === "number" ? args.sandboxTimeoutMs : 5000))
    );
    const sandboxRetries = Math.max(
      0,
      Math.min(5, Math.floor(typeof args.sandboxRetries === "number" ? args.sandboxRetries : 2))
    );
    const sandboxAllowHosts = parseAllowedHosts(args.sandboxAllowHosts);
    const zipProfile = args.zipRuntimeProfile === "cli" || args.zipRuntimeProfile === "disabled" ? args.zipRuntimeProfile : "disabled";
    const zipEnabled = args.enableZipPasswordPipeline === true && zipProfile === "cli";
    const zipEndpointRaw = typeof args.zipEndpoint === "string" ? args.zipEndpoint.trim() : "";
    const zipAllowHosts = parseAllowedHosts(args.zipAllowHosts);
    const zipTimeoutMs = Math.max(100, Math.min(60000, Math.floor(typeof args.zipTimeoutMs === "number" ? args.zipTimeoutMs : 5000)));
    const zipRetries = Math.max(0, Math.min(5, Math.floor(typeof args.zipRetries === "number" ? args.zipRetries : 2)));
    const zipCandidates = typeof args.zipCandidatePasswords === "string"
      ? args.zipCandidatePasswords.split(",").map((v) => v.trim()).filter((v) => v.length > 0).slice(0, 100)
      : [];
    const zipMaxInputBytes = Math.max(1024, Math.min(50 * 1024 * 1024, Math.floor(typeof args.zipMaxInputBytes === "number" ? args.zipMaxInputBytes : 10 * 1024 * 1024)));
    const zipMaxExpandedBytes = Math.max(1024, Math.min(250 * 1024 * 1024, Math.floor(typeof args.zipMaxExpandedBytes === "number" ? args.zipMaxExpandedBytes : 50 * 1024 * 1024)));
    const zipMaxEntries = Math.max(1, Math.min(10000, Math.floor(typeof args.zipMaxEntries === "number" ? args.zipMaxEntries : 1024)));
    const zipMaxCompressionRatio = Math.max(1, Math.min(10000, typeof args.zipMaxCompressionRatio === "number" ? args.zipMaxCompressionRatio : 250));

    const yaraProfile = args.yaraRuntimeProfile === "cli" || args.yaraRuntimeProfile === "disabled" ? args.yaraRuntimeProfile : "disabled";
    const yaraEnabled = args.enableYaraScan === true && yaraProfile === "cli";
    const yaraEndpointRaw = typeof args.yaraEndpoint === "string" ? args.yaraEndpoint.trim() : "";
    const yaraAllowHosts = parseAllowedHosts(args.yaraAllowHosts);
    const yaraTimeoutMs = Math.max(100, Math.min(60000, Math.floor(typeof args.yaraTimeoutMs === "number" ? args.yaraTimeoutMs : 5000)));
    const yaraRetries = Math.max(0, Math.min(5, Math.floor(typeof args.yaraRetries === "number" ? args.yaraRetries : 2)));
    const yaraProfileName = typeof args.yaraProfile === "string" && args.yaraProfile.trim() !== "" ? args.yaraProfile.trim() : "default";

    const preCtx = signal === undefined ? { input, args: {} } : { input, args: {}, signal };
    const preOut = await basicPreTriage.run(preCtx);
    if (preOut.type !== "string") {
      throw new Error("Unexpected pre-triage output type");
    }

    const pre = JSON.parse(preOut.value) as PreTriageReport;
    const { findings, reasons, score } = buildFindings(pre);
    const verdict = toVerdict(score, suspiciousThreshold, maliciousThreshold);

    const recommendations: string[] = [];
    if (verdict === "malicious") {
      recommendations.push("Escalate to L2/L3 for immediate containment and deeper malware analysis.");
      recommendations.push("Run dynamic sandbox analysis and correlate with threat intel.");
    } else if (verdict === "suspicious") {
      recommendations.push("Escalate for analyst validation and enrichment.");
      recommendations.push("Run additional IOC reputation checks and campaign correlation.");
    } else {
      recommendations.push("Keep sample archived and monitor for new matching telemetry.");
    }
    if (pre.binaryAnalysis.format === "pe" && pre.trustAnalysis.status === "unsigned") {
      recommendations.push("Treat unsigned PE binaries as higher-risk until publisher trust is established.");
    }
    if (pre.trustAnalysis.status === "signed") {
      recommendations.push("Review embedded certificate metadata before promoting the sample as trusted.");
    }
    recommendations.push("Review mocked capabilities before relying on this report for production decisions.");

    const stixObjects = toStixIndicators(pre);
    const mispAttributes = toMispAttributes(pre);
    const sandbox: SandboxIntegration = {
      enabled: sandboxEnabled,
      runtimeProfile: sandboxProfile,
      attempted: false,
      status: sandboxEnabled ? "skipped" : "disabled",
      endpoint: null,
      responseCode: null,
      submissionId: null,
      error: null
    };
    const zipPasswordPipeline: ZipIntegration = {
      enabled: zipEnabled,
      runtimeProfile: zipProfile,
      attempted: false,
      status: zipEnabled ? "skipped" : "disabled",
      endpoint: null,
      responseCode: null,
      candidateCount: zipCandidates.length,
      matchedPassword: null,
      error: null
    };
    const yara: YaraIntegration = {
      enabled: yaraEnabled,
      runtimeProfile: yaraProfile,
      attempted: false,
      status: yaraEnabled ? "skipped" : "disabled",
      endpoint: null,
      responseCode: null,
      matchCount: 0,
      ruleMatches: [],
      error: null
    };
    let archiveAnalysis: TriageReport["archiveAnalysis"] = {
      format: "none",
      entryCount: 0,
      totalCompressedBytes: 0,
      totalUncompressedBytes: 0,
      encryptedEntries: 0,
      maxCompressionRatio: 1,
      suspiciousPaths: [],
      entries: [],
      guards: {
        pathTraversalSafe: true,
        withinEntryLimit: true,
        withinExpandedBytesLimit: true,
        withinCompressionRatioLimit: true,
        enforced: false,
        safeToSubmit: false,
        reasons: []
      }
    };

    if (sandboxEnabled) {
      if (!sandboxEndpointRaw) {
        sandbox.status = "failed";
        sandbox.error = "sandboxEndpoint is required when sandbox submit is enabled";
      } else {
        const endpoint = validateEndpoint("Sandbox", sandboxEndpointRaw, sandboxAllowHosts);
        sandbox.attempted = true;
        sandbox.endpoint = endpoint.toString();
        const sandboxResult = await submitJsonWithRetry({
          endpoint,
          timeoutMs: sandboxTimeoutMs,
          retries: sandboxRetries,
          payload: {
            sha256: pre.hashes.sha256,
            inputType: input.type,
            sampleBase64: inputBase64,
            sizeBytes: inputBytes.length,
            verdict,
            riskScoreNorm: score,
            iocs: pre.iocs
          },
          errorPrefix: "sandbox",
          validateBody: (body) =>
            hasSubmissionId(body) ? null : "sandbox_invalid_response_body"
        });
        sandbox.status = sandboxResult.status;
        sandbox.responseCode = sandboxResult.responseCode;
        const submissionCandidate = sandboxResult.body?.submissionId ?? sandboxResult.body?.id;
        sandbox.submissionId = typeof submissionCandidate === "string" ? submissionCandidate : null;
        sandbox.error = sandboxResult.error;
      }
    }

    const zipInputBytes = input.type === "bytes" ? input.value : undefined;
    if (zipInputBytes && zipInputBytes.length >= 4 && zipInputBytes[0] === 0x50 && zipInputBytes[1] === 0x4b) {
      archiveAnalysis = inspectZipArchive({
        bytes: zipInputBytes,
        maxEntries: zipMaxEntries,
        maxExpandedBytes: zipMaxExpandedBytes,
        maxCompressionRatio: zipMaxCompressionRatio
      });
    }
    if (zipEnabled) {
      if (!zipEndpointRaw) {
        zipPasswordPipeline.status = "failed";
        zipPasswordPipeline.error = "zipEndpoint is required when ZIP password pipeline is enabled";
      } else if (!zipInputBytes || zipInputBytes.length < 4 || zipInputBytes[0] !== 0x50 || zipInputBytes[1] !== 0x4b) {
        zipPasswordPipeline.status = "skipped";
        zipPasswordPipeline.error = "Input is not a ZIP payload";
      } else if (zipInputBytes.length > zipMaxInputBytes) {
        zipPasswordPipeline.status = "failed";
        zipPasswordPipeline.error = `ZIP input exceeds zipMaxInputBytes=${zipMaxInputBytes}`;
      } else if (archiveAnalysis.format !== "zip") {
        zipPasswordPipeline.status = "failed";
        zipPasswordPipeline.error = "ZIP archive headers could not be inspected safely";
      } else if (!archiveAnalysis.guards.safeToSubmit) {
        zipPasswordPipeline.status = "failed";
        zipPasswordPipeline.error = archiveAnalysis.guards.reasons[0] ?? "zip_archive_failed_safety_checks";
      } else {
        const endpoint = validateEndpoint("ZIP", zipEndpointRaw, zipAllowHosts);
        zipPasswordPipeline.attempted = true;
        zipPasswordPipeline.endpoint = endpoint.toString();
        const zipResult = await submitJsonWithRetry({
          endpoint,
          timeoutMs: zipTimeoutMs,
          retries: zipRetries,
          payload: {
            sha256: pre.hashes.sha256,
            archiveBase64: bytesToBase64(zipInputBytes),
            sizeBytes: zipInputBytes.length,
            candidates: zipCandidates,
            archiveAnalysis
          },
          errorPrefix: "zip",
          validateBody: (body) =>
            hasZipPipelineResult(body) ? null : "zip_invalid_response_body"
        });
        zipPasswordPipeline.status = zipResult.status;
        zipPasswordPipeline.responseCode = zipResult.responseCode;
        const matched = zipResult.body?.matchedPassword ?? zipResult.body?.password;
        zipPasswordPipeline.matchedPassword = typeof matched === "string" ? matched : null;
        zipPasswordPipeline.error = zipResult.error;
      }
    }

    if (yaraEnabled) {
      if (!yaraEndpointRaw) {
        yara.status = "failed";
        yara.error = "yaraEndpoint is required when YARA scan is enabled";
      } else {
        const endpoint = validateEndpoint("YARA", yaraEndpointRaw, yaraAllowHosts);
        yara.attempted = true;
        yara.endpoint = endpoint.toString();
        const yaraResult = await submitJsonWithRetry({
          endpoint,
          timeoutMs: yaraTimeoutMs,
          retries: yaraRetries,
          payload: {
            sha256: pre.hashes.sha256,
            inputType: input.type,
            sampleBase64: inputBase64,
            sizeBytes: inputBytes.length,
            profile: yaraProfileName,
            iocs: pre.iocs,
            heuristics: pre.heuristics.map((h) => h.id)
          },
          errorPrefix: "yara",
          validateBody: (body) =>
            hasYaraResult(body) ? null : "yara_invalid_response_body"
        });
        yara.status = yaraResult.status;
        yara.responseCode = yaraResult.responseCode;
        const matchesRaw = yaraResult.body?.ruleMatches;
        if (Array.isArray(matchesRaw)) {
          yara.ruleMatches = matchesRaw.filter((v): v is string => typeof v === "string");
        }
        yara.matchCount = yara.ruleMatches.length;
        yara.error = yaraResult.error;
      }
    }

    const provenance: TriageReport["provenance"] = {
      derivedIndicators: buildIndicatorProvenance(pre),
      adapterSubmissions: [
        {
          adapter: "sandbox",
          attempted: sandbox.attempted,
          status: sandbox.status,
          endpoint: sandbox.endpoint,
          responseCode: sandbox.responseCode,
          error: sandbox.error,
          requestSummary: {
            sampleSha256: pre.hashes.sha256,
            inputType: input.type,
            sizeBytes: inputBytes.length,
            riskScoreNorm: score,
            verdict,
            iocCount:
              pre.iocs.urls.length +
              pre.iocs.domains.length +
              pre.iocs.emails.length +
              pre.iocs.ipv4.length +
              pre.iocs.ipv6.length +
              pre.iocs.cves.length +
              pre.iocs.jwt.length
          },
          responseSummary: {
            submissionId: sandbox.submissionId
          }
        },
        {
          adapter: "zipPasswordPipeline",
          attempted: zipPasswordPipeline.attempted,
          status: zipPasswordPipeline.status,
          endpoint: zipPasswordPipeline.endpoint,
          responseCode: zipPasswordPipeline.responseCode,
          error: zipPasswordPipeline.error,
          requestSummary: {
            sampleSha256: pre.hashes.sha256,
            sizeBytes: zipInputBytes?.length ?? inputBytes.length,
            candidateCount: zipCandidates.length,
            archiveFormat: archiveAnalysis.format,
            archiveEntryCount: archiveAnalysis.entryCount,
            archiveEncryptedEntries: archiveAnalysis.encryptedEntries,
            archiveSafeToSubmit: archiveAnalysis.guards.safeToSubmit
          },
          responseSummary: {
            matchedPassword: zipPasswordPipeline.matchedPassword
          }
        },
        {
          adapter: "yara",
          attempted: yara.attempted,
          status: yara.status,
          endpoint: yara.endpoint,
          responseCode: yara.responseCode,
          error: yara.error,
          requestSummary: {
            sampleSha256: pre.hashes.sha256,
            inputType: input.type,
            sizeBytes: inputBytes.length,
            profile: yaraProfileName,
            heuristicIds: pre.heuristics.map((heuristic) => heuristic.id)
          },
          responseSummary: {
            matchCount: yara.matchCount,
            ruleMatches: yara.ruleMatches
          }
        }
      ]
    };

    let mockedCapabilities = computeMockedCapabilities(pre);
    if (sandbox.status === "submitted") {
      mockedCapabilities = mockedCapabilities.filter(
        (capability) => capability !== "dynamic_sandbox_integration_cuckoo"
      );
    }
    if (zipPasswordPipeline.status === "submitted") {
      mockedCapabilities = mockedCapabilities.filter(
        (capability) => capability !== "archive_password_handling_and_zip_unpacking"
      );
    }
    if (archiveAnalysis.guards.enforced && archiveAnalysis.guards.safeToSubmit) {
      mockedCapabilities = mockedCapabilities.filter(
        (capability) => capability !== "zip_slip_and_zip_bomb_safe_unpack_guards"
      );
    }
    if (yara.status === "submitted") {
      mockedCapabilities = mockedCapabilities.filter(
        (capability) => capability !== "yara_or_yara_x_rule_scanning"
      );
    }

    const report: TriageReport = {
      version: 1,
      score: {
        riskScoreNorm: score,
        verdict,
        reasons
      },
      findings,
      mockedCapabilities,
      exports: {
        stixBundle: {
          type: "bundle",
          id: stableId("bundle", pre.hashes.sha256 ?? "unknown"),
          objects: stixObjects
        },
        mispEvent: {
          Event: {
            info: "CyberMasterChef Basic Triage Export",
            date: "1970-01-01",
            Attribute: mispAttributes
          }
        }
      },
      recommendations,
      provenance,
      evidenceBundle: {
        schemaVersion: 1,
        generatedAt: DETERMINISTIC_ISO_TIMESTAMP,
        bundleId: stableId("triage-bundle", pre.hashes.sha256 ?? "unknown"),
        sample: {
          inputType: input.type,
          sizeBytes: inputBytes.length,
          sha256: pre.hashes.sha256,
          md5: pre.hashes.md5
        },
        score: {
          riskScoreNorm: score,
          verdict,
          reasons
        },
        findingIds: findings.map((finding) => finding.id),
        recommendationCount: recommendations.length,
        exportSummary: {
          stixObjectCount: stixObjects.length,
          mispAttributeCount: mispAttributes.length
        },
        archiveSummary: {
          format: archiveAnalysis.format,
          entryCount: archiveAnalysis.entryCount,
          encryptedEntries: archiveAnalysis.encryptedEntries,
          safeToSubmit: archiveAnalysis.guards.safeToSubmit,
          guardReasons: archiveAnalysis.guards.reasons
        },
        provenance
      },
      integrations: {
        sandbox,
        zipPasswordPipeline,
        yara
      },
      archiveAnalysis,
      preTriage: pre
    };

    return { type: "string", value: JSON.stringify(report, null, 2) };
  }
};

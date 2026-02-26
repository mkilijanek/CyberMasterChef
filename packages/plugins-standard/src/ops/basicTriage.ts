import type { Operation } from "@cybermasterchef/core";
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
  };
  preTriage: PreTriageReport;
};

type SandboxIntegration = TriageReport["integrations"]["sandbox"];

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

function stableId(prefix: string, value: string): string {
  let hash = 2166136261;
  const input = `${prefix}:${value}`;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  return `${prefix}--${hash.toString(16).padStart(8, "0")}`;
}

function toStixIndicators(pre: PreTriageReport): Array<Record<string, unknown>> {
  const objects: Array<Record<string, unknown>> = [];
  const entries: Array<{ type: string; value: string; pattern: string }> = [];

  for (const v of pre.iocs.urls) entries.push({ type: "url", value: v, pattern: `[url:value = '${v}']` });
  for (const v of pre.iocs.domains) {
    entries.push({ type: "domain-name", value: v, pattern: `[domain-name:value = '${v}']` });
  }
  for (const v of pre.iocs.ipv4) entries.push({ type: "ipv4-addr", value: v, pattern: `[ipv4-addr:value = '${v}']` });
  for (const v of pre.iocs.ipv6) entries.push({ type: "ipv6-addr", value: v, pattern: `[ipv6-addr:value = '${v}']` });
  for (const v of pre.iocs.emails) {
    entries.push({ type: "email-addr", value: v, pattern: `[email-addr:value = '${v}']` });
  }
  for (const v of pre.iocs.cves) {
    entries.push({ type: "vulnerability", value: v, pattern: `[vulnerability:name = '${v}']` });
  }

  const now = "1970-01-01T00:00:00.000Z";
  for (const entry of entries) {
    objects.push({
      type: "indicator",
      spec_version: "2.1",
      id: stableId("indicator", `${entry.type}:${entry.value}`),
      created: now,
      modified: now,
      name: `${entry.type}:${entry.value}`,
      pattern_type: "stix",
      pattern: entry.pattern,
      valid_from: now,
      labels: ["malicious-activity"]
    });
  }
  return objects;
}

function toMispAttributes(pre: PreTriageReport): Array<{ type: string; category: string; value: string }> {
  const attrs: Array<{ type: string; category: string; value: string }> = [];
  for (const value of pre.iocs.urls) attrs.push({ type: "url", category: "Network activity", value });
  for (const value of pre.iocs.domains) attrs.push({ type: "domain", category: "Network activity", value });
  for (const value of pre.iocs.ipv4) attrs.push({ type: "ip-dst", category: "Network activity", value });
  for (const value of pre.iocs.ipv6) attrs.push({ type: "ip-dst", category: "Network activity", value });
  for (const value of pre.iocs.emails) attrs.push({ type: "email-src", category: "Payload delivery", value });
  for (const value of pre.iocs.cves) attrs.push({ type: "vulnerability", category: "External analysis", value });
  return attrs;
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

function validateSandboxEndpoint(endpoint: string, allowedHosts: string[]): URL {
  let parsed: URL;
  try {
    parsed = new URL(endpoint);
  } catch {
    throw new Error("Sandbox endpoint must be a valid absolute URL");
  }
  const host = parsed.hostname.toLowerCase();
  const isLoopback = host === "localhost" || host === "127.0.0.1" || host === "::1";
  const isHttps = parsed.protocol === "https:";
  if (!isHttps && !isLoopback) {
    throw new Error("Sandbox endpoint must use https (http is only allowed for loopback)");
  }
  if (allowedHosts.length > 0 && !allowedHosts.includes(host)) {
    throw new Error(`Sandbox endpoint host not allowlisted: ${host}`);
  }
  return parsed;
}

async function submitSandboxSample(args: {
  endpoint: URL;
  timeoutMs: number;
  retries: number;
  reportPayload: Record<string, unknown>;
}): Promise<{
  status: "submitted" | "failed";
  responseCode: number | null;
  submissionId: string | null;
  error: string | null;
}> {
  const fetchFn = globalThis.fetch;
  if (typeof fetchFn !== "function") {
    return {
      status: "failed",
      responseCode: null,
      submissionId: null,
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
        body: JSON.stringify(args.reportPayload),
        signal: abortCtrl.signal
      });
      clearTimeout(timer);
      lastStatus = response.status;
      if (!response.ok) {
        lastError = `sandbox_http_${response.status}`;
      } else {
        let submissionId: string | null = null;
        try {
          const body = (await response.json()) as { submissionId?: unknown; id?: unknown };
          const candidate = typeof body.submissionId === "string" ? body.submissionId : body.id;
          submissionId = typeof candidate === "string" ? candidate : null;
        } catch {
          submissionId = null;
        }
        return {
          status: "submitted",
          responseCode: response.status,
          submissionId,
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
    submissionId: null,
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

  return { findings, reasons, score: clampScore(score) };
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
    }
  ],
  run: async ({ input, args, signal }) => {
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

    if (sandboxEnabled) {
      if (!sandboxEndpointRaw) {
        sandbox.status = "failed";
        sandbox.error = "sandboxEndpoint is required when sandbox submit is enabled";
      } else {
        const endpoint = validateSandboxEndpoint(sandboxEndpointRaw, sandboxAllowHosts);
        sandbox.attempted = true;
        sandbox.endpoint = endpoint.toString();
        const sandboxResult = await submitSandboxSample({
          endpoint,
          timeoutMs: sandboxTimeoutMs,
          retries: sandboxRetries,
          reportPayload: {
            sha256: pre.hashes.sha256,
            verdict,
            riskScoreNorm: score,
            iocs: pre.iocs
          }
        });
        sandbox.status = sandboxResult.status;
        sandbox.responseCode = sandboxResult.responseCode;
        sandbox.submissionId = sandboxResult.submissionId;
        sandbox.error = sandboxResult.error;
      }
    }

    let mockedCapabilities = computeMockedCapabilities(pre);
    if (sandbox.status === "submitted") {
      mockedCapabilities = mockedCapabilities.filter(
        (capability) => capability !== "dynamic_sandbox_integration_cuckoo"
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
      integrations: {
        sandbox
      },
      preTriage: pre
    };

    return { type: "string", value: JSON.stringify(report, null, 2) };
  }
};

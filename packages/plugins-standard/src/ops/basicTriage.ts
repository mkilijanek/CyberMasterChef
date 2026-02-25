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
    format: "pe" | "unknown" | "text";
    sections: Array<{ entropy: number }>;
  };
  hashes: {
    sha1: string | null;
    sha256: string | null;
    sha512: string | null;
    md5: string | null;
    imphash: null;
    tlsh: null;
    ssdeep: null;
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
  preTriage: PreTriageReport;
};

const MOCKED_CAPABILITIES = [
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

  if (pre.hashes.imphash === null || pre.hashes.tlsh === null || pre.hashes.ssdeep === null) {
    findings.push({
      id: "mocked-hash-capabilities",
      severity: "low",
      description: "Some advanced hash/fuzzy-hash fields are placeholders in this build."
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

    const report: TriageReport = {
      version: 1,
      score: {
        riskScoreNorm: score,
        verdict,
        reasons
      },
      findings,
      mockedCapabilities: Array.from(MOCKED_CAPABILITIES),
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
      preTriage: pre
    };

    return { type: "string", value: JSON.stringify(report, null, 2) };
  }
};

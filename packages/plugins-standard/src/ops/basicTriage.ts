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
    md5: null;
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
  recommendations: string[];
  preTriage: PreTriageReport;
};

const MOCKED_CAPABILITIES = [
  "archive_password_handling_and_zip_unpacking",
  "zip_slip_and_zip_bomb_safe_unpack_guards",
  "md5_digest_generation",
  "pe_imphash",
  "tlsh_fuzzy_hash",
  "ssdeep_fuzzy_hash",
  "yara_or_yara_x_rule_scanning",
  "authenticode_or_x509_verification",
  "stix_export",
  "misp_export",
  "dynamic_sandbox_integration_cuckoo"
] as const;

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

  if (pre.hashes.md5 === null || pre.hashes.imphash === null || pre.hashes.tlsh === null || pre.hashes.ssdeep === null) {
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

    const report: TriageReport = {
      version: 1,
      score: {
        riskScoreNorm: score,
        verdict,
        reasons
      },
      findings,
      mockedCapabilities: Array.from(MOCKED_CAPABILITIES),
      recommendations,
      preTriage: pre
    };

    return { type: "string", value: JSON.stringify(report, null, 2) };
  }
};

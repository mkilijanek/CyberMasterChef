import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { DOMAIN_DESCRIPTIONS, DOMAIN_ORDER, classifyOperation } from "../c1/domain-taxonomy.mjs";
import { loadImplementedOperations } from "./operation-inventory.mjs";

const repoRoot = resolve(import.meta.dirname, "..", "..");
const parityDir = resolve(repoRoot, "docs", "parity");
const c1MatrixPath = resolve(parityDir, "c1-operation-domain-matrix.json");
const outJsonPath = resolve(parityDir, "c2-domain-implementation-plan.json");
const outMdPath = resolve(parityDir, "c2-domain-implementation-plan.md");

const c1Rows = JSON.parse(readFileSync(c1MatrixPath, "utf-8"));
const implemented = loadImplementedOperations(repoRoot);

const implementedByDomain = new Map(DOMAIN_ORDER.map((d) => [d, []]));
for (const op of implemented) {
  const domain = classifyOperation(op.name || op.id, op.file).domain;
  const list = implementedByDomain.get(domain) ?? [];
  list.push(op);
  implementedByDomain.set(domain, list);
}

const targetByDomain = new Map(DOMAIN_ORDER.map((d) => [d, []]));
for (const row of c1Rows) {
  const list = targetByDomain.get(row.domain) ?? [];
  list.push(row);
  targetByDomain.set(row.domain, list);
}

const summary = DOMAIN_ORDER.map((domain) => {
  const target = targetByDomain.get(domain) ?? [];
  const impl = implementedByDomain.get(domain) ?? [];
  const coverage = target.length > 0 ? (impl.length / target.length) * 100 : 0;
  return {
    domain,
    description: DOMAIN_DESCRIPTIONS[domain],
    cyberChefTotal: target.length,
    implementedTotal: impl.length,
    missingEstimated: Math.max(0, target.length - impl.length),
    coveragePct: Number(coverage.toFixed(2)),
    implementationCandidates: target.slice(0, 20).map((x) => ({
      operationName: x.operationName,
      file: x.file,
      confidence: x.confidence
    }))
  };
});

const topPriority = [...summary]
  .filter((s) => s.cyberChefTotal > 0)
  .sort((a, b) => {
    if (a.coveragePct !== b.coveragePct) return a.coveragePct - b.coveragePct;
    return b.cyberChefTotal - a.cyberChefTotal;
  })
  .slice(0, 4)
  .map((s, idx) => ({
    priority: idx + 1,
    domain: s.domain,
    coveragePct: s.coveragePct,
    missingEstimated: s.missingEstimated
  }));

const payload = {
  generatedAt: new Date().toISOString(),
  source: {
    c1MatrixPath,
    implementedOpsCount: implemented.length
  },
  summary,
  topPriority
};

mkdirSync(parityDir, { recursive: true });
writeFileSync(outJsonPath, `${JSON.stringify(payload, null, 2)}\n`, "utf-8");

const md = [];
md.push("# C2 Domain Implementation Plan");
md.push("");
md.push(`Generated: ${payload.generatedAt}`);
md.push(`Implemented operations in repo: ${implemented.length}`);
md.push("");
md.push("## Priority order");
md.push("");
for (const p of topPriority) {
  md.push(`- P${p.priority}: ${p.domain} (coverage ${p.coveragePct}%, missing ~${p.missingEstimated})`);
}
md.push("");
md.push("## Domain summary");
md.push("");
for (const row of summary) {
  md.push(`### ${row.domain}`);
  md.push(`- Description: ${row.description}`);
  md.push(`- CyberChef total: ${row.cyberChefTotal}`);
  md.push(`- Implemented total: ${row.implementedTotal}`);
  md.push(`- Estimated missing: ${row.missingEstimated}`);
  md.push(`- Coverage: ${row.coveragePct}%`);
  md.push("- Candidate operations (first 20):");
  for (const c of row.implementationCandidates.slice(0, 10)) {
    md.push(`  - ${c.operationName} (${c.file}) [${c.confidence}]`);
  }
  md.push("");
}
writeFileSync(outMdPath, `${md.join("\n")}\n`, "utf-8");

process.stdout.write(
  `[c2] generated implementation plan -> ${outJsonPath}, ${outMdPath}\\n`
);

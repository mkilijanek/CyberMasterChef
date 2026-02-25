import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { classifyOperation } from "../c1/domain-taxonomy.mjs";
import { loadImplementedOperations } from "../c2/operation-inventory.mjs";

const repoRoot = resolve(import.meta.dirname, "..", "..");
const parityDir = resolve(repoRoot, "docs", "parity");
const opsDir = resolve(repoRoot, "packages", "plugins-standard", "src", "ops");
const outJsonPath = resolve(parityDir, "c3-operation-compatibility-contracts.json");
const outMdPath = resolve(parityDir, "c3-operation-compatibility-contracts.md");
const outSchemaPath = resolve(parityDir, "c3-contract-schema.md");

function inferErrorTaxonomy(sourceText) {
  const messages = [...sourceText.matchAll(/throw\s+new\s+Error\("([^"]+)"\)/g)].map((m) => m[1]);
  const uniqueMessages = [...new Set(messages)].slice(0, 20);
  const categories = new Set(["EXECUTION_ERROR"]);
  for (const msg of uniqueMessages) {
    if (/expected|input/i.test(msg)) categories.add("INVALID_INPUT_TYPE");
    if (/arg|argument|invalid/i.test(msg)) categories.add("INVALID_ARGUMENT");
  }
  return {
    categories: [...categories],
    examples: uniqueMessages
  };
}

const implemented = loadImplementedOperations(repoRoot);
const contracts = implemented.map((op) => {
  const sourcePath = resolve(opsDir, op.file);
  const sourceText = readFileSync(sourcePath, "utf-8");
  const domain = classifyOperation(op.name || op.id, op.file).domain;
  const errors = inferErrorTaxonomy(sourceText);
  return {
    operationId: op.id,
    name: op.name,
    domain,
    inputTypes: op.input,
    outputType: op.output,
    argsSchema: op.args,
    deterministic: op.deterministic,
    errorTaxonomy: errors,
    notes: {
      sourceFile: `packages/plugins-standard/src/ops/${op.file}`,
      description: op.description
    }
  };
});

contracts.sort((a, b) => a.operationId.localeCompare(b.operationId));

mkdirSync(parityDir, { recursive: true });
writeFileSync(outJsonPath, `${JSON.stringify(contracts, null, 2)}\n`, "utf-8");

const md = [];
md.push("# C3 Operation Compatibility Contracts");
md.push("");
md.push(`Generated: ${new Date().toISOString()}`);
md.push(`Total contracts: ${contracts.length}`);
md.push("");
md.push("## Contract entries (compact)");
md.push("");
for (const c of contracts) {
  md.push(`- ${c.operationId}`);
  md.push(`  - name: ${c.name}`);
  md.push(`  - domain: ${c.domain}`);
  md.push(`  - inputTypes: ${c.inputTypes.join(", ")}`);
  md.push(`  - outputType: ${c.outputType}`);
  md.push(`  - deterministic: ${c.deterministic}`);
  md.push(`  - error categories: ${c.errorTaxonomy.categories.join(", ")}`);
}
writeFileSync(outMdPath, `${md.join("\n")}\n`, "utf-8");

const schemaMd = [
  "# C3 Contract Schema",
  "",
  "Each operation compatibility contract uses the following structure:",
  "",
  "```json",
  "{",
  "  \"operationId\": \"string\",",
  "  \"name\": \"string\",",
  "  \"domain\": \"encodings-codecs|crypto-hash-kdf|compression-archive|date-time|data-formats|regex-text-advanced|network-protocol-parsers|forensic-malware-helper|misc-uncategorized\",",
  "  \"inputTypes\": [\"string|bytes|json\"],",
  "  \"outputType\": \"string|bytes|json\",",
  "  \"argsSchema\": [",
  "    {",
  "      \"key\": \"string\",",
  "      \"type\": \"string|number|boolean\",",
  "      \"label\": \"string\",",
  "      \"defaultValue\": \"serialized literal\"",
  "    }",
  "  ],",
  "  \"deterministic\": true,",
  "  \"errorTaxonomy\": {",
  "    \"categories\": [\"INVALID_INPUT_TYPE|INVALID_ARGUMENT|EXECUTION_ERROR\"],",
  "    \"examples\": [\"string\"]",
  "  },",
  "  \"notes\": {",
  "    \"sourceFile\": \"string\",",
  "    \"description\": \"string\"",
  "  }",
  "}",
  "```",
  "",
  "This schema is designed to feed C4 parity matrix and C5 differential testing gates."
];
writeFileSync(outSchemaPath, `${schemaMd.join("\n")}\n`, "utf-8");

process.stdout.write(
  `[c3] generated contracts -> ${outJsonPath}, ${outMdPath}, ${outSchemaPath}\n`
);

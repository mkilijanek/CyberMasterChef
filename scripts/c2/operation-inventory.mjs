import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function extractImports(indexSource) {
  const imports = new Map();
  const importRe = /import\s+\{\s*([A-Za-z0-9_]+)\s*\}\s+from\s+"\.\/ops\/([A-Za-z0-9_\-]+)\.js";/g;
  let m;
  while ((m = importRe.exec(indexSource)) !== null) {
    imports.set(m[1], m[2]);
  }
  return imports;
}

function extractRegisteredSymbols(indexSource) {
  const symbols = [];
  const registerRe = /registry\.register\(([A-Za-z0-9_]+)\);/g;
  let m;
  while ((m = registerRe.exec(indexSource)) !== null) {
    symbols.push(m[1]);
  }
  return symbols;
}

function extractArrayLiteral(source, key) {
  const re = new RegExp(`${key}\\s*:\\s*\\[([\\s\\S]*?)\\]`, "m");
  const m = source.match(re);
  if (!m) return [];
  return [...m[1].matchAll(/"([^"]+)"/g)].map((x) => x[1]);
}

function extractStringLiteral(source, key) {
  const re = new RegExp(`${key}\\s*:\\s*"([^"]+)"`, "m");
  const m = source.match(re);
  return m ? m[1] : "";
}

function extractOperationLiteral(source) {
  const m = source.match(/export\s+const\s+[A-Za-z0-9_]+\s*:\s*Operation\s*=\s*\{([\s\S]*?)\n\};/m);
  return m ? m[1] : source;
}

function extractArgsSchema(source) {
  const argsBlock = source.match(/args\s*:\s*\[([\s\S]*?)\]\s*,\s*run\s*:/m);
  if (!argsBlock) return [];
  const objRe = /\{([\s\S]*?)\}/g;
  const out = [];
  let m;
  while ((m = objRe.exec(argsBlock[1])) !== null) {
    const body = m[1];
    const key = extractStringLiteral(body, "key");
    const type = extractStringLiteral(body, "type");
    const label = extractStringLiteral(body, "label");
    const defaultValue = (() => {
      const lit = body.match(/defaultValue\s*:\s*([^,\n}]+)/m);
      return lit ? lit[1].trim() : "undefined";
    })();
    if (key.length > 0) {
      out.push({ key, type, label, defaultValue });
    }
  }
  return out;
}

function inferDeterminism(name, id) {
  const unstable = /(random|uuid|now|current\s*time|timestamp|date\s*now)/i;
  return !unstable.test(`${name} ${id}`);
}

export function loadImplementedOperations(repoRoot) {
  const indexPath = resolve(repoRoot, "packages", "plugins-standard", "src", "index.ts");
  const opsDir = resolve(repoRoot, "packages", "plugins-standard", "src", "ops");
  const indexSource = readFileSync(indexPath, "utf-8");
  const imports = extractImports(indexSource);
  const symbols = extractRegisteredSymbols(indexSource);

  return symbols.map((symbol, idx) => {
    const fileStem = imports.get(symbol) ?? symbol;
    const filePath = resolve(opsDir, `${fileStem}.ts`);
    const source = readFileSync(filePath, "utf-8");
    const opLiteral = extractOperationLiteral(source);
    const id = extractStringLiteral(opLiteral, "id");
    const name = extractStringLiteral(opLiteral, "name");
    const description = extractStringLiteral(opLiteral, "description");
    const input = extractArrayLiteral(opLiteral, "input");
    const output = extractStringLiteral(opLiteral, "output");
    const args = extractArgsSchema(opLiteral);
    return {
      index: idx + 1,
      symbol,
      file: `${fileStem}.ts`,
      id,
      name,
      description,
      input,
      output,
      args,
      deterministic: inferDeterminism(name, id)
    };
  });
}

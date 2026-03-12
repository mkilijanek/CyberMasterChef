import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function extractImports(indexSource) {
  const imports = new Map();
  const importRe = /import\s+\{\s*([A-Za-z0-9_]+)\s*\}\s+from\s+"(?:\.\/(?:ops\/)?)?([A-Za-z0-9_\-]+)\.js";/g;
  let m;
  while ((m = importRe.exec(indexSource)) !== null) {
    imports.set(m[1], m[2]);
  }
  return imports;
}

function extractRegisteredSymbols(indexSource) {
  const loopBindings = new Set();
  const arraySymbols = [];
  const registerArrayRe =
    /for\s*\(\s*const\s+([A-Za-z0-9_]+)\s+of\s+([A-Za-z0-9_]+)\s*\)\s*\{\s*registry\.register\(\1\);\s*\}/g;
  let m;
  while ((m = registerArrayRe.exec(indexSource)) !== null) {
    loopBindings.add(m[1]);
    arraySymbols.push(m[2]);
  }

  const symbols = [];
  const registerRe = /registry\.register\(([A-Za-z0-9_]+)\);/g;
  while ((m = registerRe.exec(indexSource)) !== null) {
    if (!loopBindings.has(m[1])) {
      symbols.push(m[1]);
    }
  }
  return [...symbols, ...arraySymbols];
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

function extractOperationLiteral(source, symbol) {
  const pattern = symbol
    ? new RegExp(`export\\s+const\\s+${symbol}\\s*(?::\\s*Operation)?\\s*=\\s*\\{([\\s\\S]*?)\\n\\};`, "m")
    : /export\s+const\s+[A-Za-z0-9_]+\s*(?::\s*Operation)?\s*=\s*\{([\s\S]*?)\n\};/m;
  const m = source.match(pattern);
  return m ? m[1] : null;
}

function extractAliasOperation(source, symbol) {
  const pattern = new RegExp(
    `export\\s+const\\s+${symbol}\\s*(?::\\s*Operation)?\\s*=\\s*createAliasOperation\\(\\s*"([^"]+)"\\s*,\\s*"([^"]+)"\\s*,\\s*"([^"]+)"\\s*,\\s*([A-Za-z0-9_]+)\\s*\\);`,
    "m"
  );
  const m = source.match(pattern);
  if (!m) return null;
  return {
    id: m[1],
    name: m[2],
    description: m[3],
    targetSymbol: m[4]
  };
}

function extractOperationArraySymbols(source, symbol) {
  const arrayRe = new RegExp(`export\\s+const\\s+${symbol}\\s*:\\s*Operation\\[\\]\\s*=\\s*\\[([\\s\\S]*?)\\];`, "m");
  const m = source.match(arrayRe);
  if (!m) return [];
  return [...m[1].matchAll(/\b([A-Za-z0-9_]+)\b/g)]
    .map((match) => match[1])
    .filter((name) => name && name !== symbol);
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

function resolveOperationMetadata(source, symbol, imports, opsDir) {
  const literal = extractOperationLiteral(source, symbol);
  if (literal) {
    const id = extractStringLiteral(literal, "id");
    const name = extractStringLiteral(literal, "name");
    const description = extractStringLiteral(literal, "description");
    const input = extractArrayLiteral(literal, "input");
    const output = extractStringLiteral(literal, "output");
    const args = extractArgsSchema(literal);
    return { id, name, description, input, output, args };
  }

  const alias = extractAliasOperation(source, symbol);
  if (!alias) {
    throw new Error(`Unable to resolve operation metadata for symbol ${symbol}`);
  }

  const targetFileStem = imports.get(alias.targetSymbol);
  if (!targetFileStem) {
    throw new Error(`Unable to resolve target import for alias ${symbol}`);
  }

  const targetSource = readFileSync(resolve(opsDir, `${targetFileStem}.ts`), "utf-8");
  const targetImports = extractImports(targetSource);
  const targetMetadata = resolveOperationMetadata(targetSource, alias.targetSymbol, targetImports, opsDir);
  return {
    id: alias.id,
    name: alias.name,
    description: alias.description,
    input: targetMetadata.input,
    output: targetMetadata.output,
    args: targetMetadata.args
  };
}

export function loadImplementedOperations(repoRoot) {
  const indexPath = resolve(repoRoot, "packages", "plugins-standard", "src", "index.ts");
  const opsDir = resolve(repoRoot, "packages", "plugins-standard", "src", "ops");
  const indexSource = readFileSync(indexPath, "utf-8");
  const imports = extractImports(indexSource);
  const symbols = extractRegisteredSymbols(indexSource);

  const operations = [];
  for (const symbol of symbols) {
    const fileStem = imports.get(symbol) ?? symbol;
    const filePath = resolve(opsDir, `${fileStem}.ts`);
    const source = readFileSync(filePath, "utf-8");
    const arraySymbols = extractOperationArraySymbols(source, symbol);
    const concreteSymbols = arraySymbols.length > 0 ? arraySymbols : [symbol];

    for (const concreteSymbol of concreteSymbols) {
      const metadata = resolveOperationMetadata(source, concreteSymbol, extractImports(source), opsDir);
      operations.push({
        symbol: concreteSymbol,
        file: `${fileStem}.ts`,
        id: metadata.id,
        name: metadata.name,
        description: metadata.description,
        input: metadata.input,
        output: metadata.output,
        args: metadata.args,
        deterministic: inferDeterminism(metadata.name, metadata.id)
      });
    }
  }

  return operations.map((op, idx) => ({
    index: idx + 1,
    ...op
  }));
}

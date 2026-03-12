export const requiredSecurityHeaders = {
  "content-security-policy": [
    "default-src 'none'",
    "script-src 'self' 'wasm-unsafe-eval'",
    "style-src 'self'",
    "img-src 'self' data:",
    "worker-src 'self'",
    "connect-src 'none'",
    "object-src 'none'",
    "base-uri 'none'",
    "frame-ancestors 'none'"
  ],
  "x-content-type-options": ["nosniff"],
  "x-frame-options": ["DENY"],
  "referrer-policy": ["no-referrer"],
  "permissions-policy": ["accelerometer=()", "camera=()", "microphone=()", "payment=()"],
  "cross-origin-resource-policy": ["same-origin"]
};

export function extractAssetPaths(indexHtml) {
  return [...new Set([...indexHtml.matchAll(/(?:src|href)=\"(\/assets\/[^\"]+)\"/g)].map((match) => match[1]))];
}

export function parseHeaderBlock(headerBlock) {
  const parsed = {};
  for (const line of headerBlock.split(/\r?\n/)) {
    const separatorIndex = line.indexOf(":");
    if (separatorIndex <= 0) {
      continue;
    }
    const name = line.slice(0, separatorIndex).trim().toLowerCase();
    const value = line.slice(separatorIndex + 1).trim();
    if (name.length > 0 && value.length > 0) {
      parsed[name] = value;
    }
  }
  return parsed;
}

export function assertSecurityHeaders(headerBlock) {
  const headers = typeof headerBlock === "string" ? parseHeaderBlock(headerBlock) : headerBlock;
  for (const [name, fragments] of Object.entries(requiredSecurityHeaders)) {
    const actual = headers[name];
    if (!actual) {
      throw new Error(`Missing security header: ${name}`);
    }
    for (const fragment of fragments) {
      if (!actual.includes(fragment)) {
        throw new Error(`Security header ${name} missing fragment: ${fragment}`);
      }
    }
  }
}

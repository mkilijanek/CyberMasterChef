export const requiredDirectives = [
  "default-src 'none'",
  "script-src 'self'",
  "style-src 'self'",
  "img-src 'self' data:",
  "worker-src 'self'",
  "connect-src 'none'",
  "object-src 'none'",
  "base-uri 'none'",
  "frame-ancestors 'none'"
];

export function validateChecklistText(text) {
  for (const directive of requiredDirectives) {
    if (!text.includes(directive)) {
      throw new Error(`[security] missing CSP directive in checklist: ${directive}`);
    }
  }
}

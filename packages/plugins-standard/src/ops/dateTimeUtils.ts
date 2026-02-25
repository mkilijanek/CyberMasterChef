const TOKEN_REGEX = /(YYYY|MM|DD|HH|mm|ss|SSS|Z)/g;

const TOKEN_PATTERNS: Record<string, string> = {
  YYYY: "(\\d{4})",
  MM: "(\\d{2})",
  DD: "(\\d{2})",
  HH: "(\\d{2})",
  mm: "(\\d{2})",
  ss: "(\\d{2})",
  SSS: "(\\d{1,3})",
  Z: "(Z|[+-]\\d{2}:?\\d{2})"
};

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function parseDateTimeWithFormat(value: string, format: string): Date {
  const tokens: string[] = [];
  let regexText = "";
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = TOKEN_REGEX.exec(format)) !== null) {
    const literal = format.slice(lastIndex, match.index);
    regexText += escapeRegex(literal);
    const token = match[1];
    if (!token) {
      lastIndex = match.index + match[0].length;
      continue;
    }
    regexText += TOKEN_PATTERNS[token] ?? "";
    tokens.push(token);
    lastIndex = match.index + token.length;
  }
  regexText += escapeRegex(format.slice(lastIndex));

  const regex = new RegExp(`^${regexText}$`);
  const capture = regex.exec(value);
  if (!capture) {
    throw new Error(`Input does not match format: ${format}`);
  }

  const parts: Record<string, string> = {};
  tokens.forEach((token, index) => {
    parts[token] = capture[index + 1] ?? "";
  });

  const year = Number.parseInt(parts.YYYY ?? "0", 10);
  const month = Number.parseInt(parts.MM ?? "1", 10);
  const day = Number.parseInt(parts.DD ?? "1", 10);
  const hour = Number.parseInt(parts.HH ?? "0", 10);
  const minute = Number.parseInt(parts.mm ?? "0", 10);
  const second = Number.parseInt(parts.ss ?? "0", 10);
  const ms = Number.parseInt((parts.SSS ?? "0").padEnd(3, "0"), 10);

  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
    throw new Error("Invalid date components in format");
  }

  let timestamp = Date.UTC(year, month - 1, day, hour, minute, second, ms);

  if (parts.Z && parts.Z !== "Z") {
    const offsetMatch = /([+-])(\d{2}):?(\d{2})/.exec(parts.Z);
    if (!offsetMatch) {
      throw new Error(`Invalid timezone offset: ${parts.Z}`);
    }
    const sign = offsetMatch[1] === "-" ? -1 : 1;
    const offsetHours = Number.parseInt(offsetMatch[2] ?? "0", 10);
    const offsetMinutes = Number.parseInt(offsetMatch[3] ?? "0", 10);
    const offsetMs = sign * (offsetHours * 60 + offsetMinutes) * 60 * 1000;
    timestamp -= offsetMs;
  }

  return new Date(timestamp);
}

export function parseDateTime(value: string, format?: string): Date {
  if (format && format.length > 0) {
    return parseDateTimeWithFormat(value, format);
  }
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) {
    throw new Error("Unable to parse datetime input");
  }
  return new Date(parsed);
}

export function formatDateTime(date: Date, format: string): string {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  const hour = date.getUTCHours();
  const minute = date.getUTCMinutes();
  const second = date.getUTCSeconds();
  const ms = date.getUTCMilliseconds();

  const replacements: Record<string, string> = {
    YYYY: String(year).padStart(4, "0"),
    MM: String(month).padStart(2, "0"),
    DD: String(day).padStart(2, "0"),
    HH: String(hour).padStart(2, "0"),
    mm: String(minute).padStart(2, "0"),
    ss: String(second).padStart(2, "0"),
    SSS: String(ms).padStart(3, "0"),
    Z: "Z"
  };

  return format.replace(TOKEN_REGEX, (token) => replacements[token] ?? token);
}

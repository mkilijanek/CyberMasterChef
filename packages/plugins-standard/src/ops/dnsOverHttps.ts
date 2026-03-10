import type { Operation } from "@cybermasterchef/core";

function parseAllowedHosts(raw: unknown): string[] {
  if (typeof raw !== "string") return [];
  return raw
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter((value) => value.length > 0);
}

function validateResolverUrl(urlRaw: string, allowedHosts: string[]): URL {
  let url: URL;
  try {
    url = new URL(urlRaw);
  } catch {
    throw new Error("resolverUrl must be a valid absolute URL");
  }
  const host = url.hostname.toLowerCase();
  const isLoopback = host === "localhost" || host === "127.0.0.1" || host === "::1";
  const isHttps = url.protocol === "https:";
  if (!isHttps && !isLoopback) {
    throw new Error("resolverUrl must use https (http allowed only for loopback)");
  }
  if (allowedHosts.length > 0 && !allowedHosts.includes(host)) {
    throw new Error(`resolverUrl host not allowlisted: ${host}`);
  }
  return url;
}

export const dnsOverHttps: Operation = {
  id: "network.dnsOverHttps",
  name: "DNS over HTTPS",
  description: "Queries DNS records over HTTPS for domains from input.",
  input: ["bytes", "string"],
  output: "string",
  args: [
    {
      key: "recordType",
      label: "Record Type",
      type: "select",
      defaultValue: "A",
      options: [
        { label: "A", value: "A" },
        { label: "AAAA", value: "AAAA" },
        { label: "TXT", value: "TXT" },
        { label: "MX", value: "MX" }
      ]
    },
    {
      key: "resolverUrl",
      label: "Resolver URL",
      type: "string",
      defaultValue: "https://dns.google/resolve"
    },
    {
      key: "allowHosts",
      label: "Allowlisted resolver hosts",
      type: "string",
      defaultValue: "dns.google,cloudflare-dns.com,localhost,127.0.0.1"
    },
    {
      key: "timeoutMs",
      label: "Timeout ms",
      type: "number",
      defaultValue: 5000
    }
  ],
  run: async ({ input, args }) => {
    if (input.type !== "bytes" && input.type !== "string") {
      throw new Error("Expected bytes or string input");
    }
    const fetchFn = globalThis.fetch;
    if (typeof fetchFn !== "function") {
      throw new Error("fetch is not available in this runtime");
    }

    const text = input.type === "bytes" ? new TextDecoder().decode(input.value) : input.value;
    const domains = text
      .split(/\s+/g)
      .map((value) => value.trim().toLowerCase())
      .filter((value) => /^[a-z0-9.-]+\.[a-z]{2,}$/i.test(value));
    const uniqueDomains = [...new Set(domains)];
    if (uniqueDomains.length === 0) return { type: "string", value: "" };

    const recordType =
      args.recordType === "A" || args.recordType === "AAAA" || args.recordType === "TXT" || args.recordType === "MX"
        ? args.recordType
        : "A";
    const resolverUrlRaw =
      typeof args.resolverUrl === "string" && args.resolverUrl.trim().length > 0
        ? args.resolverUrl
        : "https://dns.google/resolve";
    const resolverUrl = validateResolverUrl(resolverUrlRaw, parseAllowedHosts(args.allowHosts));
    const timeoutMs = Math.max(
      100,
      Math.min(30000, Math.floor(typeof args.timeoutMs === "number" ? args.timeoutMs : 5000))
    );

    const rows: string[] = [];
    for (const domain of uniqueDomains) {
      const endpoint = new URL(resolverUrl.toString());
      endpoint.searchParams.set("name", domain);
      endpoint.searchParams.set("type", recordType);

      const abortCtrl = new AbortController();
      const timer = setTimeout(() => abortCtrl.abort(), timeoutMs);
      try {
        const response = await fetchFn(endpoint.toString(), {
          headers: { accept: "application/dns-json" },
          signal: abortCtrl.signal
        });
        if (!response.ok) {
          rows.push(`${domain}\tERROR\thttp_${response.status}`);
          continue;
        }
        const payload = (await response.json()) as {
          Answer?: Array<{ data?: unknown }>;
        };
        const answers = (payload.Answer ?? [])
          .map((entry) => (typeof entry.data === "string" ? entry.data : ""))
          .filter((value) => value.length > 0);
        rows.push(`${domain}\t${answers.join("|")}`);
      } catch (error) {
        rows.push(`${domain}\tERROR\t${error instanceof Error ? error.message : String(error)}`);
      } finally {
        clearTimeout(timer);
      }
    }

    return { type: "string", value: rows.join("\n") };
  }
};

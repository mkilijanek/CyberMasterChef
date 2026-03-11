import type { Operation } from "@cybermasterchef/core";

type FamilyVersion = { family: string; version: string | null };

function familyVersion(family: string, version: string | null): FamilyVersion {
  return { family, version };
}

function detectBrowser(userAgent: string): FamilyVersion {
  const edge = userAgent.match(/Edg\/([0-9.]+)/);
  if (edge) return familyVersion("Edge", edge[1]!);

  const chrome = userAgent.match(/Chrome\/([0-9.]+)/);
  if (chrome) return familyVersion("Chrome", chrome[1]!);

  const firefox = userAgent.match(/Firefox\/([0-9.]+)/);
  if (firefox) return familyVersion("Firefox", firefox[1]!);

  const safari = userAgent.match(/Version\/([0-9.]+).*Safari\//);
  if (safari) return familyVersion("Safari", safari[1]!);

  return familyVersion("Unknown", null);
}

function detectOs(userAgent: string): FamilyVersion {
  const windows = userAgent.match(/Windows NT ([0-9.]+)/);
  if (windows) return familyVersion("Windows", windows[1]!);

  const android = userAgent.match(/Android ([0-9.]+)/);
  if (android) return familyVersion("Android", android[1]!);

  const ios = userAgent.match(/(?:iPhone OS|CPU iPhone OS) ([0-9_]+)/);
  if (ios) return familyVersion("iOS", ios[1]!.replace(/_/g, "."));

  const mac = userAgent.match(/Mac OS X ([0-9_]+)/);
  if (mac) return familyVersion("macOS", mac[1]!.replace(/_/g, "."));

  if (/Linux/i.test(userAgent)) return familyVersion("Linux", null);
  return familyVersion("Unknown", null);
}

function detectDeviceType(userAgent: string): string {
  if (/bot|crawler|spider/i.test(userAgent)) return "bot";
  if (/ipad|tablet/i.test(userAgent)) return "tablet";
  if (/mobile|iphone|android/i.test(userAgent)) return "mobile";
  return "desktop";
}

function detectEngine(userAgent: string): string {
  if (/AppleWebKit/i.test(userAgent) && /Chrome|Edg\//i.test(userAgent)) return "Blink";
  if (/AppleWebKit/i.test(userAgent) || /Safari\//i.test(userAgent)) return "WebKit";
  if (/Gecko\//i.test(userAgent) && /Firefox\//i.test(userAgent)) return "Gecko";
  return "Unknown";
}

export const parseUserAgent: Operation = {
  id: "network.parseUserAgent",
  name: "Parse User Agent",
  description: "Parses a user-agent string into browser, OS, engine, and device metadata.",
  input: ["string"],
  output: "json",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    const raw = input.value.trim();
    if (!raw) throw new Error("Expected user-agent input");
    return {
      type: "json",
      value: {
        raw,
        browser: detectBrowser(raw),
        os: detectOs(raw),
        engine: detectEngine(raw),
        deviceType: detectDeviceType(raw)
      }
    };
  }
};

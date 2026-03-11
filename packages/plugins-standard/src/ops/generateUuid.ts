import type { Operation } from "@cybermasterchef/core";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const NIL_UUID = "00000000-0000-0000-0000-000000000000";

function parseUuidBytes(value: string): Uint8Array {
  const normalized = value.trim().toLowerCase();
  if (!UUID_RE.test(normalized)) {
    throw new Error("Expected RFC4122 UUID namespace");
  }
  const hex = normalized.replace(/-/g, "");
  const bytes = new Uint8Array(16);
  for (let i = 0; i < 16; i++) {
    bytes[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

function formatUuid(bytes: Uint8Array): string {
  const hex = Array.from(bytes, (value) => value.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(
    16,
    20
  )}-${hex.slice(20)}`;
}

async function generateV5(namespace: string, name: string): Promise<string> {
  const namespaceBytes = parseUuidBytes(namespace);
  const nameBytes = new TextEncoder().encode(name);
  const payload = new Uint8Array(namespaceBytes.length + nameBytes.length);
  payload.set(namespaceBytes, 0);
  payload.set(nameBytes, namespaceBytes.length);
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-1", payload));
  const bytes = digest.slice(0, 16);
  bytes[6] = (bytes[6]! & 0x0f) | 0x50;
  bytes[8] = (bytes[8]! & 0x3f) | 0x80;
  return formatUuid(bytes);
}

export const generateUuid: Operation = {
  id: "forensic.generateUuid",
  name: "Generate UUID",
  description: "Generates UUID values in nil, random v4, or deterministic v5 mode.",
  input: ["string"],
  output: "string",
  args: [
    {
      key: "version",
      label: "Version",
      type: "string",
      defaultValue: "v4"
    },
    {
      key: "namespace",
      label: "Namespace UUID",
      type: "string",
      defaultValue: ""
    },
    {
      key: "name",
      label: "Name override",
      type: "string",
      defaultValue: ""
    }
  ],
  run: async ({ input, args }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    const version = typeof args.version === "string" ? args.version.trim().toLowerCase() : "v4";
    if (version === "nil") {
      return { type: "string", value: NIL_UUID };
    }
    if (version === "v5") {
      const namespace = typeof args.namespace === "string" ? args.namespace.trim() : "";
      const name =
        typeof args.name === "string" && args.name.trim() !== "" ? args.name : input.value;
      if (!namespace) {
        throw new Error("namespace is required for UUID v5 generation");
      }
      return { type: "string", value: await generateV5(namespace, name) };
    }
    return { type: "string", value: crypto.randomUUID() };
  }
};

import type { Operation } from "@cybermasterchef/core";

const REGISTRY_KEY_REGEX =
  /\b(?:HKLM|HKCU|HKCR|HKU|HKEY_LOCAL_MACHINE|HKEY_CURRENT_USER|HKEY_CLASSES_ROOT|HKEY_USERS)\\[A-Za-z0-9_.-]+(?:\\[A-Za-z0-9_.-]+)+\b/g;

export const extractRegistryKeys: Operation = {
  id: "forensic.extractRegistryKeys",
  name: "Extract Registry Keys",
  description: "Extracts unique Windows registry key paths from text input.",
  input: ["string"],
  output: "string",
  args: [],
  run: ({ input }) => {
    if (input.type !== "string") throw new Error("Expected string input");
    const matches = input.value.match(REGISTRY_KEY_REGEX) ?? [];
    const unique = new Set<string>();
    for (const match of matches) unique.add(match);
    return { type: "string", value: Array.from(unique).join("\n") };
  }
};

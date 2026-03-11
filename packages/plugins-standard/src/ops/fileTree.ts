import type { Operation } from "@cybermasterchef/core";

type TreeNode = {
  name: string;
  type: "directory" | "file";
  children?: TreeNode[];
};

function normalizePath(value: string): string | null {
  const normalized = value
    .trim()
    .replace(/\\/g, "/")
    .replace(/\/+/g, "/")
    .replace(/^\/+|\/+$/g, "");
  return normalized === "" ? null : normalized;
}

function collectPaths(value: unknown): string[] {
  if (typeof value === "string") {
    return value
      .split(/\r?\n/)
      .map((entry) => normalizePath(entry))
      .filter((entry): entry is string => entry !== null);
  }
  if (Array.isArray(value)) {
    return value.flatMap((entry) => collectPaths(entry));
  }
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    if (typeof record.name === "string") {
      const normalized = normalizePath(record.name);
      return normalized === null ? [] : [normalized];
    }
    if (typeof record.path === "string") {
      const normalized = normalizePath(record.path);
      return normalized === null ? [] : [normalized];
    }
    if (typeof record.normalizedPath === "string") {
      const normalized = normalizePath(record.normalizedPath);
      return normalized === null ? [] : [normalized];
    }
    if ("entries" in record) return collectPaths(record.entries);
    if ("files" in record) return collectPaths(record.files);
  }
  return [];
}

function insertPath(root: TreeNode[], path: string): void {
  const parts = path.split("/");
  let currentLevel = root;
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i] ?? "";
    const isLeaf = i === parts.length - 1;
    let node = currentLevel.find((candidate) => candidate.name === part);
    if (!node) {
      node = { name: part, type: isLeaf ? "file" : "directory" };
      if (!isLeaf) {
        node.children = [];
      }
      currentLevel.push(node);
      currentLevel.sort((left, right) => left.name.localeCompare(right.name));
    } else if (!isLeaf && node.type === "file") {
      node.type = "directory";
      node.children = [];
    }
    if (!isLeaf) {
      node.children ??= [];
      currentLevel = node.children;
    }
  }
}

export const fileTree: Operation = {
  id: "forensic.fileTree",
  name: "File Tree",
  description: "Builds a deterministic file tree from newline-delimited paths or archive entry JSON.",
  input: ["string", "json"],
  output: "json",
  args: [],
  run: ({ input }) => {
    const rawValue =
      input.type === "string" ? input.value : input.type === "json" ? input.value : null;
    if (rawValue === null) throw new Error("Expected string or json input");
    const uniquePaths = Array.from(new Set(collectPaths(rawValue))).sort((a, b) =>
      a.localeCompare(b)
    );
    const tree: TreeNode[] = [];
    for (const path of uniquePaths) insertPath(tree, path);
    return {
      type: "json",
      value: {
        pathCount: uniquePaths.length,
        paths: uniquePaths,
        tree
      }
    };
  }
};

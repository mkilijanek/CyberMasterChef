declare module "node:fs" {
  export function readFileSync(path: string | number, encoding: string): string;
}

declare const process: {
  argv: string[];
  stderr: { write(s: string): void };
  stdout: { write(s: string): void };
  exit(code?: number): never;
};

declare module "node:fs" {
  export function readFileSync(path: string | number, encoding: string): string;
  export function readdirSync(path: string): string[];
  export function writeFileSync(path: string, data: string, encoding: string): void;
}

declare const process: {
  argv: string[];
  stderr: { write(s: string): void };
  stdout: { write(s: string): void };
  exit(code?: number): never;
};

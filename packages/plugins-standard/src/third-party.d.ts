declare module "compressjs" {
  export const Bzip2: {
    compressFile: (data: Uint8Array) => number[];
    decompressFile: (data: Uint8Array) => number[];
  };
}

declare module "papaparse" {
  type ParseResult = {
    data: unknown[];
    errors: unknown[];
    meta: Record<string, unknown>;
  };

  type ParseConfig = {
    delimiter?: string;
    header?: boolean;
    skipEmptyLines?: boolean;
  };

  type UnparseConfig = {
    delimiter?: string;
    header?: boolean;
  };

  const Papa: {
    parse: (input: string, config?: ParseConfig) => ParseResult;
    unparse: (input: unknown, config?: UnparseConfig) => string;
  };

  export default Papa;
}

declare module "tar-stream" {
  export const pack: () => unknown;
  export const extract: () => unknown;
}

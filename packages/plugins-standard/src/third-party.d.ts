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

declare module "amfjs" {
  export const AMF0: unknown;
  export const AMF3: unknown;
  export class AMFEncoder {
    constructor(stream: NodeJS.WritableStream);
    writeObject(value: unknown, type: unknown): void;
  }
  export class AMFDecoder {
    constructor(stream: NodeJS.ReadableStream);
    decode(type: unknown): unknown;
  }
}

declare module "he" {
  const he: {
    encode: (value: string, options?: { encodeEverything?: boolean }) => string;
    decode: (value: string) => string;
  };
  export default he;
}

declare module "html-to-text" {
  export function htmlToText(value: string, options?: { wordwrap?: false | number }): string;
}

declare module "jsonata" {
  type JsonataExpression = {
    evaluate: (input: unknown) => unknown;
  };
  export default function jsonata(expression: string): JsonataExpression;
}

declare module "qrcode" {
  const qrcode: {
    toBuffer: (
      input: string,
      options?: { type?: string; scale?: number; margin?: number }
    ) => Promise<Buffer>;
  };
  export default qrcode;
}

declare module "xml-formatter" {
  export default function xmlFormatter(
    xml: string,
    options?: { indentation?: string }
  ): string;
}

declare module "exif-reader" {
  const exifReader: (buffer: Buffer) => Record<string, unknown>;
  export default exifReader;
}

declare module "quoted-printable" {
  const quotedPrintable: {
    encode: (input: string) => string;
    decode: (input: string) => string;
  };
  export default quotedPrintable;
}

declare module "protobufjs" {
  type Root = {
    lookupType: (name: string) => {
      verify: (payload: Record<string, unknown>) => string | null;
      fromObject: (payload: Record<string, unknown>) => unknown;
      encode: (message: unknown) => { finish: () => Uint8Array };
      decode: (buffer: Buffer) => unknown;
      toObject: (message: unknown, options?: Record<string, unknown>) => Record<string, unknown>;
    };
  };
  const protobuf: {
    parse: (schema: string) => { root: Root };
  };
  export default protobuf;
}

declare module "@msgpack/msgpack" {
  export function encode(input: unknown): Uint8Array;
  export function decode(input: Uint8Array): unknown;
}

export default function loadModule<
  T extends Record<string, unknown>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  D extends Record<string, unknown> | ((...args: any) => any)
>(
  src: string
): {
  readonly exported: T & {
    // eslint-disable-next-line functional/prefer-readonly-type
    default: D;
  };
  readonly source: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly error?: any;
} {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const exported = require(src);
    return {
      exported /* : "default" in exported ? exported.default : exported */,
      source: src,
    };
  } catch (err) {
    return {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      exported: {} as any,
      source: src,
      error: err,
    };
  }
}

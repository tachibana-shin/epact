export type RequireModuleResult = {
  readonly error: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly message: null | any;
  readonly module: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    readonly [name: string]: any;
  } | null;
  readonly pathJoined: string;
};

export function requireModule(pathJoined: string): RequireModuleResult {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const module = require(pathJoined);
    return {
      error: false,
      message: null,
      module: "default" in module ? module.default : module,
      pathJoined,
    };
  } catch (e) {
    return {
      error: true,
      message: e,
      module: null,
      pathJoined,
    };
  }
}

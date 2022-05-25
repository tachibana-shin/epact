import { describe, it, expect } from "vitest";

import parseWarning from "./parseWarning";
import chalk from "chalk";

describe("test node warning", () => {
  it("show node:warn", () => {
    expect(
      parseWarning(
        `(node:12083) [DEP0148] DeprecationWarning: Use of deprecated folder mapping "./dist/" in the "exports" field module resolution of the package at /workspace/express-fw/demo/node_modules/express-fw-next/package.json.
      Update this package.json to use a subpath pattern like "./dist/*".'`,
        false
      )
    ).toBe(
      chalk.yellow(`DeprecationWarning: Use of deprecated folder mapping "./dist/" in the "exports" field module resolution of the package at /workspace/express-fw/demo/node_modules/express-fw-next/package.json.
      Update this package.json to use a subpath pattern like "./dist/*".'`)
    );
  });
  it("hide node:warn", () => {
    expect(
      parseWarning(
        `(node:12083) [DEP0148] DeprecationWarning: Use of deprecated folder mapping "./dist/" in the "exports" field module resolution of the package at /workspace/express-fw/demo/node_modules/express-fw-next/package.json.
      Update this package.json to use a subpath pattern like "./dist/*".'`,
        true
      )
    ).toBe(false);
  });
});

describe("test normal waring or not warn", () => {
  it("is warn", () => {
    expect(parseWarning(`Warning: my warn`, false)).toBe(
      chalk.yellow("Warning: my warn")
    );
  });
  it("not is warn", () => {
    expect(parseWarning("Hello World", false)).toBe(null);
  });
});

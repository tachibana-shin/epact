import { describe, expect, it } from "vitest"

import parseWarning from "./parseWarning"

describe("test node warning", () => {
  it("hide node:warn", () => {
    expect(
      parseWarning(
        `(node:12083) [DEP0148] DeprecationWarning: Use of deprecated folder mapping "./dist/" in the "exports" field module resolution of the package at /workspace/express-fw/demo/node_modules/express-fw-next/package.json.
      Update this package.json to use a subpath pattern like "./dist/*".'`
      )
    ).toBe(false)
  })
})

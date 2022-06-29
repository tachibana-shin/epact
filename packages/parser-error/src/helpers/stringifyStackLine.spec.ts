import { describe, expect, it } from "vitest"

import { stringifyStackLine } from "./stringifyStackLine"

describe("parseStackLine", () => {
  it("should parse a stack line", () => {
    expect(
      stringifyStackLine({
        name: "IncomingMessage.get",
        file: "/workspaces/epact/demo/src/pages/index.ts",
        line: 14,
        column: 17
      })
    ).toBe(
      "    at IncomingMessage.get (/workspaces/epact/demo/src/pages/index.ts:14:17)"
    )
  })
  it("should parse a stack line with a <anonymous>", () => {
    expect(
      stringifyStackLine({
        name: "<anonymous>",
        file: "/workspaces/epact/packages/epact/dist/index.js",
        line: 198,
        column: 37
      })
    ).toBe(
      "    at <anonymous> (/workspaces/epact/packages/epact/dist/index.js:198:37)"
    )
  })
})

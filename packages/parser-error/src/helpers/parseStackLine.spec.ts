import { describe, expect, it } from "vitest"

import { parseStackLine } from "./parseStackLine"

describe("parseStackLine", () => {
  it("should parse a stack line", () => {
    expect(
      parseStackLine(
        "    at IncomingMessage.get (/workspaces/epact/demo/src/pages/index.ts:14:17)"
      )
    ).toEqual({
      name: "IncomingMessage.get",
      file: "/workspaces/epact/demo/src/pages/index.ts",
      line: 14,
      column: 17
    })
  })
  it("should parse a stack line with a <anonymous>", () => {
    expect(
      parseStackLine(
        "    at <anonymous> (/workspaces/epact/packages/epact/dist/index.js:198:37)"
      )
    ).toEqual({
      name: "<anonymous>",
      file: "/workspaces/epact/packages/epact/dist/index.js",
      line: 198,
      column: 37
    })
  })
})

import { describe, expect, test } from "vitest"

import parsePathRoute from "./parsePathRoute"

describe("test normal", () => {
  describe.each([
    ["foo/bar", "/foo/bar"],
    ["foo/bar/index", "/foo/bar"],
    ["foo/_bar/index", "/foo/:bar"],
    ["foo/_bar", "/foo/:bar?"],
    ["foo/_bar!.ts", "/foo/:bar"],
    ["foo/_bar/index!", "/foo/:bar/index"],
    ["manga/chap-_chap", "/manga/chap-:chap?"],
    ["manga/_id/chap-_chap", "/manga/:id/chap-:chap?"]
  ])("test parse('%s')", (source, result) => {
    test(`equal is ${result}`, () => {
      expect(parsePathRoute(source)).toBe(result)
    })
  })
})

describe("test strict mode", () => {
  describe.each([
    ["foo/bar", "/foo/bar"],
    ["foo/bar/index", "/foo/bar"],
    ["foo/_bar", "/foo/:bar"],
    ["foo/_bar!.ts", "/foo/:bar"],
    ["foo/_bar/index!", "/foo/:bar/index"],
    ["manga/chap-_chap", "/manga/chap-:chap"],
    ["manga/_id/chap-_chap", "/manga/:id/chap-:chap"]
  ])("test parse('%s')", (source, result) => {
    test(`equal is ${result}`, () => {
      expect(
        parsePathRoute(source, {
          strict: true
        })
      ).toBe(result)
    })
  })
})

describe("test _", () => {
  describe.each([
    ["_", "(?:/*)?"],
    ["_/", "(?:/*)?"],
    ["product/_", "/product(?:/*)?"]
  ])("test parse('%s')", (source, result) => {
    test(`equal is ${result}`, () => {
      expect(parsePathRoute(source)).toBe(result)
    })
  })
})

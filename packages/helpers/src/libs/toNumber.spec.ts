import { describe, expect, it } from "vitest"

import toNumber from "./toNumber"

describe("toNumber argument", () => {
  it("is string", () => {
    expect(toNumber("string")).toBe(undefined)
  })
  it("is string[]", () => {
    expect(toNumber(["string"])).toBe(undefined)
  })

  it("is like number", () => {
    expect(toNumber("12")).toBe(12)
  })
  it("is array like number", () => {
    expect(toNumber(["12"])).toBe(12)
  })

  it("is undefined", () => {
    expect(toNumber(undefined)).toBe(undefined)
  })
})

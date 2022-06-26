import { describe, expect, it } from "vitest"

import toArrayNumber from "./toArrayNumber"

describe("toArrayNumber", () => {
  it("is string", () => {
    expect(toArrayNumber("string")).toEqual([])
  })
  it("is string[]", () => {
    expect(toArrayNumber(["string"])).toEqual([])
  })
  it("is number", () => {
    expect(toArrayNumber(1)).toEqual([1])
  })
  it("is number[]", () => {
    expect(toArrayNumber([1])).toEqual([1])
  })
  it("is like number", () => {
    expect(toArrayNumber("1")).toEqual([1])
  })
  it("is like number[]", () => {
    expect(toArrayNumber(["1"])).toEqual([1])
  })
})

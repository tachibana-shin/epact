import { describe, expect, it } from "vitest"

import { filterBreak } from "./filterBreak"

describe("filterBreak", () => {
  it("test array", () => {
    expect(
      filterBreak([1, 2, 3, 4, 5], (val) => (val <= 2 ? val : false))
    ).toEqual([1, 2])
  })
})

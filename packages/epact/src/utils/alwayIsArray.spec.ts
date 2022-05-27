import { describe, expect, it } from "vitest"
import alwayIsArray from "./alwayIsArray"

describe.each([
  {
    inp: 1,
    out: [1],
  },
  {
    inp: [1],
    out: [1],
  },
])("alwayIsArray($inp)", ({ inp, out }) => {
  it(`equal ${out}`, () => {
    expect(alwayIsArray(inp)).toEqual(out)
  })
})

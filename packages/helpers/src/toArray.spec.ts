import { describe, expect, it } from "vitest"

import toArray from "./toArray"

describe.each([
  {
    in: 12,
    out: [12]
  },
  {
    in: [12],
    out: [12]
  },
  {
    in: {
      0: 12,
      length: 1
    },
    out: [12]
  }
])("toArray($in)", ({ in: inp, out }) => {
  it("equal", () => {
    expect(toArray(inp)).toEqual(out)
  })
})

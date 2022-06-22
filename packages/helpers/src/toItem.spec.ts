import { describe, expect, it } from "vitest"

import toItem from "./toItem"

describe.each([
  {
    in: 12,
    out: 12
  },
  {
    in: [12],
    out: 12
  },
  {
    in: {
      0: 12,
      length: 1
    },
    out: 12
  }
])("toItem($in)", ({ in: inp, out }) => {
  it("equal", () => {
    expect(toItem(inp)).toEqual(out)
  })
})

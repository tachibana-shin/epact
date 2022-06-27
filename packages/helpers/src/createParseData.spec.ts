import { describe, expect, it } from "vitest"

import createParseData from "./createParseData"

describe("parseData", () => {
  it("passed", () => {
    const c = createParseData({
      page: Number,

      user: Object as {
        name: string
      },

      quality: Number
    })

    expect(
      // eslint-disable-next-line quotes
      c({ page: "1", quality: ["1", "2", "3"], user: '{"name": "shin"}' })
    ).toEqual({
      page: 1,
      quality: 1,
      user: {
        name: "shin"
      }
    })
  })
})

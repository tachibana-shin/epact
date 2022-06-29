import { router, useRoute, useQuery } from "epact"

export default router({
  async get() {
    console.time()
    ;(this.query.page)
    console.timeEnd()

    console.time("with useQuery")

    new Proxy(this.query, {}).page

    console.timeEnd("with useQuery")

    return this.r({
      data: {
        ok: true
      }
    })
  }
})

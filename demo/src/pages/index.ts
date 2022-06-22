import { router } from "epact"

export default router<{
  params: "page" | "query"
  query: {
    q: string[]
  }
  get: {
    data: {
      message: string
    }
    body: {
      username: string
      password: string
    }
  }
}>({
  async get() {
    console.log(this.params.query)
    console.log(this.query.q)
    console.log(this.body.username)

    return this.return({
      message: "Hello world"
    })
  }
})

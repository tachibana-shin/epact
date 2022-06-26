import { router ,useRoute } from "epact"

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
    this.params.page
    console.log(this.params.query)
    console.log(this.query.q)
    console.log(this.body.username)

    console.log(useRoute().stack[0].handle.toString())

    return this.return({
      message: "Hello world"
    })
  }
})

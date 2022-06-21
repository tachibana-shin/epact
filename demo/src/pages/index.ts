import { router } from "epact"

export default router({
  get(req, res) {
    res.json({
      message: "Hello express!"
    })
  }
})

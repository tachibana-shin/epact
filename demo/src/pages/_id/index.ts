import { router, useRoute } from "epact"

export default router({
  get(req, res) {
    console.log(req.params)

    console.log(useRoute())

    res.json({
      message: req.params.id
    })
  }
})

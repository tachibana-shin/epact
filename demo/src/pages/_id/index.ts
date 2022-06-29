import { router, useRoute } from "epact"

export default router({
  get(req, res) {
    
    res.json({
      message: req.params.id
    })
  }
})

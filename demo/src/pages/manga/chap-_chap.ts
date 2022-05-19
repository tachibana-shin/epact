import { page } from "express-fw-next";

export default page({
  get(req, res) {
    res.end("Hello manga");
  },
});

import { page } from "express-fw";

export default page({
  get(req, res) {
    res.end("Hello manga");
  },
});



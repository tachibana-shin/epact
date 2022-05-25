import { page } from "epact";

export default page({
  get(req, res) {
    res.end("Hello manga");
  },
});

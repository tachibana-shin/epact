exports.middleware = ["auth"];

exports.get = (req, res) => {
  res.render("index", { title: "Express" });
};

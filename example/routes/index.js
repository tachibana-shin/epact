exports.middleware = {
  "GET": "auth"
}

exports.get = (req, res) => {
  res.render("index", { title: "Express" });
};

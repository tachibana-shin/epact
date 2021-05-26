exports.middleware = ["auth"];

exports.get = ({ params: { id } }, res) => {
  res.render("user", { user: id });
};

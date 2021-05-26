module.exports = (req, res, next) => {
  console.log("middleware auth active!");
  next();
};

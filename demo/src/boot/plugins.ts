import cookieParser from "cookie-parser";
import { boot } from "epact";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";

export default boot(() => {
  return [
    morgan("dev"),
    helmet(),
    cookieParser(),
    express.urlencoded({ extended: true }),
    express.json(),
    (req, res, next) => {
      console.log("call")
      req.user = "shin"
      next()
    }
  ]
});

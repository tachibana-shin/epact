import cookieParser from "cookie-parser";
import express from "express";
import { boot } from "express-fw-next/dist/core";
import helmet from "helmet";
import alias from "module-alias";
import morgan from "morgan";

export default boot(() => {
  return [
    morgan("dev"),
    helmet(),
    cookieParser(),
    express.urlencoded({ extended: true }),
    express.json(),
  ]
});

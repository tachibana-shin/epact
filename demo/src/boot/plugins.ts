import cookieParser from "cookie-parser";
import { boot } from "express-fw";
import express from "express";
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
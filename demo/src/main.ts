import path from "path";

import chalk from "chalk";
import express, { NextFunction, Request, Response } from "express";
import createError from "http-errors";

import { createApp } from "../../src/index";

const app = createApp();

// error handler
// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
app.use((err: any, req: Request, res: Response, next: NextFunction): void => {
  console.error(chalk.red(err.message));
  res.end("Error");
});

app.use(express.static(path.join(__dirname, "..", "public")));

export default app;
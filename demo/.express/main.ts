
import express from "express"

const app = express();

import * as boot__dotenv from "../src/boot/dotenv"
import * as boot__plugins from "../src/boot/plugins"

import { createBoot } from "express-fw-next/dist/core"

[...createBoot(app, boot__dotenv), ...createBoot(app, boot__plugins)].forEach(boot => {
  app.use(boot)
})
import page__src_pages_index_ts from "../src/pages/index.ts";
import page__src_pages__id_index_ts from "../src/pages/_id/index.ts";

import { createPage } from "express-fw-next/dist/core";

app.use("/", createPage("index.ts", page__src_pages_index_ts).router);
app.use("/", createPage("_id/index.ts", page__src_pages__id_index_ts).router);
app.listen(3000, () => {
  console.log("App is running at port 3000")
})
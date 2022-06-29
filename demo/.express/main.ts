import express from "express"

const app = express();

import * as boot__src_boot_dotenv from "../src/boot/dotenv"
import * as boot__src_boot_plugins from "../src/boot/plugins"

import { createBoot } from "epact"

[...createBoot(app, boot__src_boot_dotenv.default), ...createBoot(app, boot__src_boot_plugins.default)].forEach(boot => {
  app.use(boot)
})
import page___src_pages_index_ts from "../src/pages/index";
import page___src_pages__id_index_ts from "../src/pages/_id/index";
import page___src_pages_manga_chap__chap_ts from "../src/pages/manga/chap-_chap";
import { createPage } from "epact";

app.use("/", createPage("/", page___src_pages_index_ts).router);
app.use("/", createPage("/:id", page___src_pages__id_index_ts).router);
app.use("/", createPage("/manga/chap-:chap?", page___src_pages_manga_chap__chap_ts).router);
app.use((error, req, res, next) => {
  next()
})
const timeStart = Date.now()
app.listen(3000, () => {
  console.log(`[96m⚡App is running at port ${3000} ready in ${Math.ceil(Date.now() - timeStart)}ms[39m`)
})

module.exports = app
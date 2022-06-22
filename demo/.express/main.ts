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
import { inspect } from "util"
import { AnsiConvert } from "epact"

const ansiToHtml = new AnsiConvert()
app.use((error, req, res, next) => {
  res.end(`
<!DOCTYPE html>
<html>
  <head>
    <title>Server Error</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
  </head>
  <body class="background-color: #111; color: #eee">
    <code style="white-space: pre">${ansiToHtml.toHtml(inspect(error, { showHidden: false, depth: null, colors: true }))}</code>
  </body>
</html>
`)
  next()
})
if (process.env.NODE_ENV?.toLowerCase() !== "test" && process.env.MODE !== "test" && process.env.TEST !== "true") {
  const timeStart = Date.now()
  app.listen(3000, () => {
    console.log(`[90m⚡App is running at port ${3000} ready in ${Math.ceil(Date.now() - timeStart)}ms[39m`)
  })
}
app.use(express.static("/workspaces/epact/demo/public"))
module.exports = app
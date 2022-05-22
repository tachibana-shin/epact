import express from "express"

const app = express();

import * as boot__src_boot_dotenv from "../src/boot/dotenv"
import * as boot__src_boot_plugins from "../src/boot/plugins"

import { createBoot } from "epact"

[...createBoot(app, boot__src_boot_dotenv), ...createBoot(app, boot__src_boot_plugins)].forEach(boot => {
  app.use(boot)
})
import page___src_pages_index_ts from "../src/pages/index.ts";
import page___src_pages__id_index_ts from "../src/pages/_id/index.ts";
import page___src_pages_manga_chap__chap_ts from "../src/pages/manga/chap-_chap.ts";
import { createPage } from "epact";

app.use("/", createPage("/", page___src_pages_index_ts).router);
app.use("/", createPage("/:id/", page___src_pages__id_index_ts).router);
app.use("/", createPage("/manga/chap-:chap", page___src_pages_manga_chap__chap_ts).router);

app.listen(3000, () => {
  console.log(`⚡App is running at port ${3000}`)
})
  
export default app;
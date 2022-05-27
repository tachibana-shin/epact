import { spawn } from "child_process";
import { basename, join, relative } from "path";

import chalk from "chalk";
import { watch } from "chokidar";

import { getFilepathExpressConfig } from "../../utils/loadExpressConfig";
import loadExpressConfig from "../../utils/loadExpressConfig";
import renderFileApp from "../build/renderFileApp";

function buildFileMain(config: Awaited<ReturnType<typeof loadExpressConfig>>) {
  renderFileApp(config, true);
}

export default async function test(shellScript: string) {
  const cwd = process.cwd();
  let config = await loadExpressConfig();

  buildFileMain(config);
  spawn("npx", [shellScript], {
    stdio: "inherit",
  });

  const pathExpressConfig = getFilepathExpressConfig();

  watch([...(pathExpressConfig ? [pathExpressConfig] : []), "package.json"], {
    awaitWriteFinish: {
      stabilityThreshold: 500,
    },
  }).on("change", async (path) => {
    process.stdout.write("\u001Bc");
    console.log(
      chalk.green(
        `╔════════════════════════════════════════════╗
║                                            ║
║    File "${basename(path)}" changed.       ║
║                                            ║
╚════════════════════════════════════════════╝`
      )
    );
    config = await loadExpressConfig();
    buildFileMain(config);

    // .express/${config.filename || "main.ts"}
    // dev mode
  });

  function onPageChange(path: string, action: string) {
    process.stdout.write("\u001Bc");
    // dir src/pages changed;
    console.log(
      chalk.gray(
        `======> ${relative(join(cwd, "src"), path)} ${action} <======`
      )
    );
    buildFileMain(config);
  }

  // handle change src/pages
  watch(join(cwd, "src/pages"), {
    awaitWriteFinish: {
      stabilityThreshold: 500,
    },
    ignoreInitial: true,
  })
    .on("add", (path) => onPageChange(path, "add"))
    .on("unlink", (path) => onPageChange(path, "deleted"))
    .on("unlinkDir", (path) => onPageChange(path, "deleted all"));
}

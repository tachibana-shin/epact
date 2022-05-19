import { spawn } from "child_process";
import { basename, join, relative } from "path";

import chalk from "chalk";
import chokidar from "chokidar";

import { getFilepathExpressConfig } from "../../utils/loadExpressConfig";
import loadExpressConfig from "../../utils/loadExpressConfig";
import renderFileApp from "../build/renderFileApp";

export default async function dev() {
  const cwd = process.cwd();
  const config = await loadExpressConfig();

  renderFileApp(config, false);
  startApp(cwd, config.port, config.filename);
  chokidar
    .watch([getFilepathExpressConfig() || "package.json", "package.json"], {
      awaitWriteFinish: {
        stabilityThreshold: 500,
      },
    })
    .on("change", (path) => {
      console.clear();
      console.log(
        chalk.green(
          `╔════════════════════════════════════════════╗
║                                            ║
║    File "${basename(path)}" changed.       ║
║                                            ║
╚════════════════════════════════════════════╝`
        )
      );

      renderFileApp(config, false);
      startApp(cwd, config.port, config.filename, false);

      // .express/${config.filename || "main.ts"}
      // dev mode
    });

  function onPageChange(path: string, action: string) {
    // dir src/pages changed;
    console.log(
      chalk.gray(
        `======> ${relative(join(cwd, "src/page"), path)} ${action} <======`
      )
    );
    renderFileApp(config, false);
    startApp(cwd, config.port, config.filename);
  }

  // handle change src/pages
  chokidar
    .watch(join(cwd, "src/pages"), {
      awaitWriteFinish: {
        stabilityThreshold: 500,
      },
      ignoreInitial: true,
    })
    .on("add", (path) => onPageChange(path, "add"))
    .on("remove", (path) => onPageChange(path, "deleted"));
}

function startApp(cwd: string, port = 3000, filename?: string, clear = true) {
  if (clear) console.clear();
  console.log(
    chalk.bgBlue("express:start") +
      chalk.green(chalk.bold(` start app at port ${port}!`))
  );
  spawn(
    "npx",
    ["tsx", "watch", join(cwd, `.express/${filename || "main.ts"}`)],
    {
      stdio: "inherit",
    }
  );
}

import { ChildProcess, fork } from "child_process";
import { spawn } from "child_process";
import { basename, join, relative } from "path";
import readline from "readline";

import chalk from "chalk";
import { watch } from "chokidar";

import { getFilepathExpressConfig } from "../../utils/loadExpressConfig";
import loadExpressConfig from "../../utils/loadExpressConfig";
import renderFileApp from "../build/renderFileApp";
import { Transform } from "stream";

function buildFileMain(config: Awaited<ReturnType<typeof loadExpressConfig>>) {
  renderFileApp(config, true);
}

// eslint-disable-next-line functional/no-let
let noClearConsole = false;
export default async function test(shellScript: string) {
  const cwd = process.cwd();
  let config = await loadExpressConfig();

  buildFileMain(config);
  startApp(cwd, config.filename, shellScript);

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
    noClearConsole = true;
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
    noClearConsole = true;
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

function startApp(
  cwd: string,
  filename: string = "main.ts",
  shellScript: string
) {
  // if (clear) process.stdout.write("\u001Bc");

  const fileMain = join(cwd, `.express/${filename}`);

  // console.log(
  //   chalk.bgBlue("express:start") +
  //     chalk.green(chalk.bold(` start app at port ${port}!`))
  // );

  // eslint-disable-next-line functional/no-let
  let runProcess: ChildProcess | undefined;
  function reRun() {
    if (runProcess && !runProcess.killed && runProcess.exitCode === null) {
      runProcess.kill();
    }

    runProcess = spawn("npx", [shellScript], {
      stdio: [0, "inherit", "inherit"],
      // silent : false
    });

    // runProcess.stdin?.pipe(process.stdin)

    // let rl: readline.Interface | undefined;
    // function on() {
    //   off();
    //   rl = readline.createInterface({
    //     input: process.stdin,
    //     escapeCodeTimeout: 50,
    //   });
    //   readline.emitKeypressEvents(process.stdin, rl);
    //   if (process.stdin.isTTY) process.stdin.setRawMode(true);
    //   process.stdin.on("keypress", onKeyPress);
    // }

    // function off() {
    //   rl?.close();
    //   rl = undefined;
    //   process.stdin.removeListener("keypress", onKeyPress);
    //   if (process.stdin.isTTY) process.stdin.setRawMode(false);
    // }

    // // on();

    // function onKeyPress(str, key) {
    //   if (key?.name === "c" && key?.ctrl) {
    //     process.exit();
    //   }

    //   console.log(runProcess?.listeners)

    //   // runProcess.emit("keypress", str, key);
    //   console.log("keypress", str, key);
    // }
  }

  reRun();

  const watcher = watch(fileMain, {
    ignoreInitial: true,
    ignored: [
      // Hidden directories like .git
      "**/.*/**",

      // watch .express
      "!**/.express/**",

      // 3rd party packages
      "**/{node_modules,bower_components,vendor}/**",

      // Distribution files
      "**/dist/**",
    ],
    ignorePermissionErrors: true,
  }).on("all", (action, path) => {
    if (!noClearConsole) process.stdout.write("\u001Bc");

    if (action === "change") {
      const filepath = relative(cwd, path);
      console.info(
        ` > Changed: ${
          filepath.startsWith("src/pages/") ? chalk.green("{page} ") : ""
        }${chalk.bold(chalk.cyan(filepath))}\n`
      );
    }
    reRun();
    noClearConsole = false;
  });
}

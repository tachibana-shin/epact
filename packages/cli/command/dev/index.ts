import { ChildProcess } from "child_process";
import { spawn } from "child_process";
import { basename, join, relative } from "path";
import { fileURLToPath } from "url";

import chalk from "chalk";
import { watch } from "chokidar";

import { version as VERSION } from "../../../../package.json";
import { getFilepathExpressConfig } from "../../utils/loadExpressConfig";
import loadExpressConfig from "../../utils/loadExpressConfig";
import renderFileApp from "../build/renderFileApp";

import getIPAddress from "./utils/networkIP";

function buildFileMain(
  config: Awaited<ReturnType<typeof loadExpressConfig>>,
  isUpdated: boolean
) {
  if (!isUpdated) {
    process.stdout.write("\u001Bc");
  }

  const lastTime = Date.now();
  if (!isUpdated) {
    console.info(
      chalk.cyan(`  express-fw v${VERSION}`) +
        chalk.green(" app Express running at:\n")
    );

    console.log(
      `    > Local: ${chalk.cyan(
        `http://localhost:${config.port ?? 3000}`
      )}\n` +
        `    > Network: ${chalk.cyan(
          `http://${getIPAddress()}:${config.port ?? 3000}`
        )}`
    );
  }

  renderFileApp(config, true);

  if (!isUpdated) {
    console.info(
      `\n  ${chalk.cyan(`ready in ${Math.ceil(Date.now() - lastTime)}ms.`)}\n`
    );
  } else {
    console.info(
      `\n  > Updated code. Restart app at ${chalk.cyan(
        `http://localhost:${config.port ?? 3000} in ${chalk.green(
          `${Math.ceil(Date.now() - lastTime)} ms.`
        )}\n`
      )}`
    );
  }
}

// eslint-disable-next-line functional/no-let
let noClearConsole = false;
export default async function dev() {
  const cwd = process.cwd();
  const config = await loadExpressConfig();

  buildFileMain(config, false);
  startApp(cwd, config.filename);

  const pathExpressConfig = getFilepathExpressConfig();

  watch([...(pathExpressConfig ? [pathExpressConfig] : []), "package.json"], {
    awaitWriteFinish: {
      stabilityThreshold: 500,
    },
  }).on("change", (path) => {
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
    noClearConsole = true;
    buildFileMain(config, true);

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
    buildFileMain(config, true);
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isDependencyPath(data: any): data is {
  // eslint-disable-next-line functional/prefer-readonly-type
  type: "dependency";
  // eslint-disable-next-line functional/prefer-readonly-type
  path: string;
} {
  return data && "type" in data && data.type === "dependency";
}

function startApp(cwd: string, filename?: string) {
  // if (clear) process.stdout.write("\u001Bc");

  const fileMain = join(cwd, `.express/${filename || "main.ts"}`);

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

    runProcess = spawn(
      process.execPath,
      ["--loader", "esm-loader-fix", fileMain],
      {
        stdio: ["inherit", "inherit", "inherit", "ipc"],
      }
    );

    runProcess.on("message", (data) => {
      // Collect run-time dependencies to watch
      if (isDependencyPath(data)) {
        const dependencyPath = data.path.startsWith("file:")
          ? fileURLToPath(data.path)
          : data.path;

        if (!dependencyPath.startsWith("/")) return;
        // console.log('adding', dependencyPath);
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        watcher!.add(dependencyPath);
      }
    });
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

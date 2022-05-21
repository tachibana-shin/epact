import { ChildProcess } from "child_process";
import { basename, join, relative } from "path";
import { fileURLToPath } from "url";

import chalk from "chalk";
import chokidar, { watch } from "chokidar";
import spawn from "cross-spawn";

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isDependencyPath(data: any): data is {
  // eslint-disable-next-line functional/prefer-readonly-type
  type: "dependency";
  // eslint-disable-next-line functional/prefer-readonly-type
  path: string;
} {
  return data && "type" in data && data.type === "dependency";
}

// eslint-disable-next-line functional/no-let
let watcher: ReturnType<typeof watch> | null = null;
function startApp(cwd: string, port = 3000, filename?: string, clear = true) {
  if (clear) process.stdout.write("\u001Bc");

  const fileMain = join(cwd, `.express/${filename || "main.ts"}`);

  console.log(
    chalk.bgBlue("express:start") +
      chalk.green(chalk.bold(` start app at port ${port}!`))
  );

  // eslint-disable-next-line functional/no-let
  let runProcess: ChildProcess | undefined;
  function reRun() {
    if (runProcess && !runProcess.killed && runProcess.exitCode === null) {
      runProcess.kill();
    }

    process.stdout.write("\u001Bc");

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

  watcher?.close();

  watcher = watch(fileMain, {
    ignoreInitial: true,
    ignored: [
      // Hidden directories like .git
      "**/.*/**",

      // 3rd party packages
      "**/{node_modules,bower_components,vendor}/**",

      // Distribution files
      "**/dist/**",
    ],
    ignorePermissionErrors: true,
  }).on("all", reRun);
}

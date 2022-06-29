import { spawn } from "child_process"
import type { ChildProcess } from "child_process"
import { basename, join, relative } from "path"
import { fileURLToPath } from "url"

import chalk from "chalk"
import { watch } from "chokidar"

import { version as VERSION } from "../../../package.json"
import loadExpressConfig, {
  getFilepathExpressConfig
} from "../../utils/loadExpressConfig"
import renderFileApp from "../build/renderFileApp"

import createFilterNodeWarn from "./filterNodeWarn"
import getIPAddress from "./utils/networkIP"

function buildFileMain(
  config: Awaited<ReturnType<typeof loadExpressConfig>>,
  isUpdated: boolean
) {
  if (!isUpdated) process.stdout.write("\u001Bc")

  const lastTime = Date.now()
  if (!isUpdated) {
    process.stdout.write(
      chalk.cyan(`  EPACT v${VERSION}`) +
        chalk.green(" app Express running at:\n\n")
    )

    process.stdout.write(
      `    > Local: ${chalk.cyan(
        `http://localhost:${config.port ?? 3000}`
      )}\n\n` +
        `    > Network: ${chalk.cyan(
          `http://${getIPAddress()}:${config.port ?? 3000}\n`
        )}`
    )
  }

  renderFileApp(config, true)

  if (!isUpdated) {
    process.stdout.write(
      `\n  ${chalk.cyan(`ready in ${Math.ceil(Date.now() - lastTime)}ms.`)}\n`
    )
  } else {
    process.stdout.write(
      `\n  > Updated code. Restart app at ${chalk.cyan(
        `http://localhost:${config.port ?? 3000} in ${chalk.green(
          `${Math.ceil(Date.now() - lastTime)} ms.`
        )}\n`
      )}`
    )
  }
}

// eslint-disable-next-line functional/no-let
let noClearConsole = false
export default async function dev() {
  const cwd = process.cwd()
  // eslint-disable-next-line functional/no-let
  let config = await loadExpressConfig()

  buildFileMain(config, false)
  startApp(cwd, config.filename)

  const pathExpressConfig = getFilepathExpressConfig()

  watch([...(pathExpressConfig ? [pathExpressConfig] : []), "package.json"], {
    awaitWriteFinish: {
      stabilityThreshold: 500
    }
  }).on("change", async (path) => {
    process.stdout.write("\u001Bc")
    process.stdout.write(
      ` > Changed: ${chalk.bold(chalk.green(basename(path)))}\n`
    )

    config = await loadExpressConfig()
    noClearConsole = true
    buildFileMain(config, true)

    // .express/${config.filename || "main.ts"}
    // dev mode
  })

  function onPageChange(path: string, action: string) {
    process.stdout.write("\u001Bc")
    // dir src/pages changed;
    process.stdout.write(
      chalk.gray(` > ${relative(join(cwd, "src"), path)} ${action}`)
    )
    noClearConsole = true
    buildFileMain(config, true)
  }

  // handle change src/pages
  watch(join(cwd, "src/pages"), {
    awaitWriteFinish: {
      stabilityThreshold: 500
    },
    ignoreInitial: true
  })
    .on("add", (path) => onPageChange(path, "add"))

    .on("unlink", (path) => onPageChange(path, "deleted"))

    .on("unlinkDir", (path) => onPageChange(path, "deleted all"))
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isDependencyPath(data: any): data is {
  type: "dependency"
  path: string
} {
  return data && "type" in data && data.type === "dependency"
}

function startApp(cwd: string, filename = "main.ts") {
  // if (clear) process.stdout.write("\u001Bc");

  const fileMain = join(cwd, `.express/${filename}`)

  // process.stdout.write(
  //   chalk.bgBlue("express:start") +
  //     chalk.green(chalk.bold(` start app at port ${port}!`))
  // );

  // eslint-disable-next-line functional/no-let
  let runProcess: ChildProcess | undefined
  function reRun() {
    if (runProcess && !runProcess.killed && runProcess.exitCode === null)
      runProcess.kill()

    runProcess = spawn(
      process.execPath,
      [
        "--loader",
        "@esbuild-kit/esm-loader",
        "--require",
        "@esbuild-kit/cjs-loader",
        fileMain
      ],
      {
        stdio: ["inherit", "inherit", "pipe", "ipc"]
      }
    )

    runProcess.stderr?.pipe(createFilterNodeWarn()).pipe(process.stderr)

    runProcess.on("message", (data) => {
      // Collect run-time dependencies to watch
      if (isDependencyPath(data)) {
        const dependencyPath = data.path.startsWith("file:")
          ? fileURLToPath(data.path)
          : data.path

        if (!dependencyPath.startsWith("/")) return
        // process.stdout.write('adding', dependencyPath);
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        watcher!.add(dependencyPath)
      }
    })
  }

  reRun()

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
      "**/dist/**"
    ],
    ignorePermissionErrors: true
  }).on("all", (action, path) => {
    if (!noClearConsole) process.stdout.write("\u001Bc")

    if (action === "change") {
      const filepath = relative(cwd, path)
      process.stdout.write(
        ` > Changed: ${
          filepath.startsWith("src/pages/") ? chalk.green("{page} ") : ""
        }${chalk.bold(chalk.cyan(filepath))}\n`
      )
    }
    reRun()
    noClearConsole = false
  })
}

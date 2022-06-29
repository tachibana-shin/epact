import { existsSync, readdirSync } from "fs"
import { readFile, writeFile } from "fs/promises"
import { join } from "path"
import { copy, move } from "fs-extra"

import type { Options } from "tsup"
import { build } from "tsup"

import loadExpressConfig from "../../utils/loadExpressConfig"

import renderFileApp from "./renderFileApp"
import chalk from "chalk"

function toAppend(
  apper?: string | Record<string, string>
): Record<string, string> | void {
  if (!apper) return void 0

  if (typeof apper === "string") {
    return {
      js: apper
    }
  }

  return apper
}

export default async function (
  options: Omit<Options, "entry" | "splitting" | "clean"> & {
    readonly systemless?: boolean
    readonly "no-minify"?: boolean
    readonly debug?: boolean
  }
) {
  const pathToDir = process.cwd()

  const config = await loadExpressConfig()

  renderFileApp(config, false, options.systemless || undefined)

  const banner = toAppend(config.build?.banner)

  const footer = toAppend(config.build?.footer)

  const outDir = config.build?.outDir ?? "dist"

  await build({
    entry: [join(pathToDir, `.express/main.ts`)],
    splitting: true,
    clean: true,
    // ...config.build,
    watch: config.build?.watch,
    outDir,
    keepNames: config.build?.keepNames,
    target: config.build?.target ?? "node16",
    ignoreWatch: config.build?.ignoreWatch,
    onSuccess: config.build?.onSuccess,
    inject: config.build?.inject,
    external: config.build?.external,
    jsxFactory: config.build?.jsxFactory ?? "React.createElement",
    jsxFragment: config.build?.jsxFragment ?? "React.Fragment",
    silent: config.build?.silent,
    metafile: config.build?.metafile,
    platform: "node",
    ...options,
    loader: config.loader,
    minify: !(options["no-minify"] || config.build?.noMinify || options.debug),
    sourcemap: options.debug ? "inline" : options.sourcemap,
    define: {
      ...config.env,
      ...options.env
    },
    env: {
      ...config.env,
      ...options.env
    },
    dts: false,
    format: config.build?.format
      ? Array.isArray(config.build?.format)
        ? config.build.format
        : [config.build.format]
      : ["cjs"],
    esbuildOptions(options, context) {
      if (banner) options.banner = banner
      if (footer) options.footer = footer

      config.build?.esbuildOptions?.(options, context)
    }
  })

  if (config.build?.filepath) {
    const [from, to] = [
      join(outDir, "main.js"),

      join(outDir, config.build.filepath)
    ]
    console.log(
      chalk.green("EPC ") + `Rename ${chalk.bold(from)} -> ${chalk.bold(to)}`
    )
    await move(from, to)
  }
  if (config.build?.pkgFile) {
    console.log(
      chalk.green("EPC ") + `${chalk.bold(join(outDir, "package.json"))}`
    )
    await buildFilePkgJSON(pathToDir, outDir)
  }

  await copyFilesInPublicExtra(pathToDir, outDir)
}

async function buildFilePkgJSON(cwd: string, outDir: string) {
  const { dependencies } = JSON.parse(
    await readFile(join(cwd, "package.json"), "utf8")
  )

  await writeFile(
    join(cwd, outDir, "package.json"),
    JSON.stringify({ dependencies }, (k, v) => v, 2)
  )
}
async function copyFilesInPublicExtra(cwd: string, outDir: string) {
  const pub = join(cwd, "public-extra")

  if (!existsSync(pub)) return

  await Promise.all(
    readdirSync(pub).map((filename) => {
      return copy(join(pub, filename), join(cwd, outDir, filename))
    })
  )
}

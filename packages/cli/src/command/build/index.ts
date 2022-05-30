import { join } from "path"

import type { Options } from "tsup"
import { build } from "tsup"

import loadExpressConfig from "../../utils/loadExpressConfig"

import renderFileApp from "./renderFileApp"

function toAppend(
  apper?: string | Record<string, string>,
  format?: string[]
): Record<string, string> {
  if (!apper) return void 0

  if (typeof apper === "string") {
    return {
      js: apper,
      [format?.includes("esm") ? "mjs" : "js"]: apper
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

  const banner = toAppend(config.build.banner)
  const footer = toAppend(config.build.footer)
  build({
    entry: [join(pathToDir, `.express/${config.filename ?? "main.ts"}`)],
    splitting: true,
    clean: true,
    // ...config.build,
    watch: config.build?.watch,
    outDir: config.build?.outDir,
    keepNames: config.build?.keepNames,
    target: config.build?.target,
    ignoreWatch: config.build?.ignoreWatch,
    onSuccess: config.build?.onSuccess,
    inject: config.build?.inject,
    external: config.build?.external,
    jsxFactory: config.build?.jsxFactory,
    jsxFragment: config.build?.jsxFragment,
    silent: config.build?.silent,
    metafile: config.build?.metafile,
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
      : [],
    esbuildOptions(options, context) {
      if (banner) options.banner = banner
      if (footer) options.footer = footer

      config.build?.esbuildOptions?.(options, context)
    }
  })
}

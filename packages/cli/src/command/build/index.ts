import { join } from "path"

import type { Options } from "tsup"
import { build } from "tsup"

import loadExpressConfig from "../../utils/loadExpressConfig"

import renderFileApp from "./renderFileApp"

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

  build({
    entry: [join(pathToDir, ".express/main.ts")],
    splitting: true,
    clean: true,
    ...config.build,
    format: config.build?.format
      ? Array.isArray(config.build?.format)
        ? config.build.format
        : [config.build.format]
      : [],
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
    dts: false
  })
}

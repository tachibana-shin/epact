import { existsSync, mkdirSync, writeFileSync } from "fs"
import { join } from "path"

import type { DefineConfig } from "../../../../epact/src"

import renderApp from "./lib/renderApp"
import renderBoot from "./lib/renderBoot"
import renderCatchError from "./lib/renderCatchError"
import renderListenApp from "./lib/renderListenApp"
import renderPage from "./lib/renderPage"
import renderPublic from "./lib/renderPublic"

export default function renderFileApp(
  config: DefineConfig,
  devMode: boolean,
  forceSystemless?: true
) {
  const pathToDir = process.cwd()

  const code =
    `${renderApp() +
    renderBoot(config.boot, devMode) +
    (config.prePublic ? renderPublic(config, devMode, pathToDir) : "") +
    renderPage(config.router, config.baseUrl) +
    renderCatchError(devMode) +
    renderListenApp(
      forceSystemless
        ? false
        : devMode
        ? config.port ?? 3000
        : config.build?.port ?? config.port ?? 3000,
      devMode
    ) +
    (config.prePublic ? "" : renderPublic(config, devMode, pathToDir))
    }\n` +
    `${config.footer || "export default app;"}`

  if (!existsSync(join(pathToDir, ".express")))
    mkdirSync(join(pathToDir, ".express"))

  writeFileSync(
    join(pathToDir, `.express/main.ts`),
    code
  )
}

import { existsSync } from "fs"
import { join } from "path"

import fs from "fs-extra"
import type { DefineConfig } from "../../../../../epact"

export default function renderPublic(
  config: DefineConfig,
  devMode: boolean,
  cwd: string
) {
  const publicDir = `${cwd}/public`

  if (devMode) return `app.use(express.static("${join(cwd, "public")}"))`

  if (!existsSync(publicDir)) return ""

  fs.copySync(publicDir, join(cwd, config.build?.outDir || "dist", "public"), {
    recursive: true
  })

  // eslint-disable-next-line no-template-curly-in-string
  return "app.use(express.static(`${__dirname}/public`))"
}

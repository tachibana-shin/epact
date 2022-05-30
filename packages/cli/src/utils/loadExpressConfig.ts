import { readFileSync } from "fs"
import { relative } from "path"

import { bundleRequire } from "bundle-require"
import JoyCon from "joycon"

import type { DefineConfig, defineConfig } from "../../../epact/src"

// eslint-disable-next-line camelcase
export const Filenames_Config = [
  "express.config.js",
  "express.config.ts",
  "express.config.cjs",
  "express.config.mjs",
  "express.config.json",
  "epact.config.js",
  "epact.config.ts",
  "epact.config.cjs",
  "epact.config.mjs",
  "epact.config.json",
  "package.json"
]
const CONFIG_DEFAULT: DefineConfig = {
  port: 3000
}

const joy = new JoyCon()

function loadJSON(filepath: string) {
  try {
    return JSON.parse(readFileSync(filepath, "utf8"))
  } catch (error) {
    if (error instanceof Error) {
      // eslint-disable-next-line functional/no-throw-statement
      throw new TypeError(
        `Failed to parse ${relative(process.cwd(), filepath)}: ${error.message}`
      )
    } else {
      // eslint-disable-next-line functional/no-throw-statement
      throw error
    }
  }
}
export function getFilepathExpressConfig(): string | null {
  return joy.resolveSync(Filenames_Config, process.cwd())
}
export default async function loadExpressConfig(): Promise<
  ReturnType<typeof defineConfig>
  > {
  const configPath = await joy.resolve(Filenames_Config, process.cwd())

  if (configPath === null) return CONFIG_DEFAULT

  if (configPath.endsWith(".json")) {
    if (configPath.endsWith("package.json")) return loadJSON(configPath).express

    return loadJSON(configPath)
  }

  return await bundleRequire({
    filepath: configPath
  }).then(({ mod }) => mod.express || mod.default)
}

import { spawnSync } from "child_process"
import { existsSync } from "fs"
import { join } from "path"

function isInstalled(name: ReturnType<typeof getPkgManager>) {
  try {
    return spawnSync(name, ["--version"]).status === 0
  } catch {
    return false
  }
}

export default function getPkgManager(cwd: string): "npm" | "yarn" | "pnpm" {
  if (existsSync(join(cwd, "pnpm-lock.yaml"))) return "pnpm"
  if (existsSync(join(cwd, "yarn.lock"))) return "yarn"
  if (existsSync(join(cwd, "package.lock"))) return "npm"

  if (isInstalled("pnpm")) return "pnpm"
  if (isInstalled("yarn")) return "yarn"

  return "npm"
}

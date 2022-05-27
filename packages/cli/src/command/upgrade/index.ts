import { execSync, spawnSync } from "child_process"
import { readFileSync } from "fs"
import { join } from "path"

import chalk from "chalk"
import { ltr } from "semver"

import { name as NAME } from "../../../package.json"

import getPkgManager from "./utils/getPkgManager"

upgrade(false)
export default function upgrade(install: boolean) {
  const packages = JSON.parse(
    readFileSync(join(process.cwd(), "package.json"), "utf8")
  ).dependencies as Record<string, string>

  const pkgmName = getPkgManager(process.cwd())

  process.stdout.write("\u001Bc")
  process.stdout.write(chalk.cyan(` Getting verision with ${pkgmName}\n`))

  const canUpdate = []
  for (const [name] of Object.entries(packages)) {
    if (name !== NAME && name !== "express") continue

    const lastVersion = JSON.parse(
      execSync(
        `${getPkgManager(process.cwd())} info ${name} version --json`
      ).toString()
    )
    const currentVersion = execSync(
      `${getPkgManager(process.cwd())} view ${name} version`
    )
      .toString()
      .trim()

    if (ltr(lastVersion, currentVersion)) {
      process.stdout.write(
        `${chalk.green(`${name}@${lastVersion}`)} (current: ${chalk.gray(
          currentVersion
        )})`
      )
      canUpdate.push({
        name,
        version: lastVersion
      })
    }
  }

  if (install) {
    canUpdate.forEach(({ name }) => {
      spawnSync(
        pkgmName,
        [pkgmName === "npm" ? "install" : "add", `${name}@latest`],
        {
          stdio: "inherit"
        }
      )
    })

    process.stdout.write(chalk.green("All package upgraded:\n"))

    canUpdate.forEach(({ name, version }) => {
      process.stdout.write(chalk.green(`${name}@${version}`))
    })
  }
}

import chalk from "chalk"

export default function parseWarning(message: string): string | null | false {
  // is node

  const matchNodeWarn = message.match(/^\(node:\d+\) (\[[^\s]+\] )?/)

  if (matchNodeWarn?.index === 0) return false
  // remove (node:12083) [DEP0148]

  return message.includes("Warning: ") ? chalk.yellow(message) : null
}

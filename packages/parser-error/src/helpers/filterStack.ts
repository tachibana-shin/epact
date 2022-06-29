import { relative } from "path"

import chalk from "chalk"

import { filterBreak } from "../utils/filterBreak"

import { parseStackLine } from "./parseStackLine"
import { stringifyStackLine } from "./stringifyStackLine"

export function filterStack(
  stackLines: string[],
  exclude: (stack: Exclude<ReturnType<typeof parseStackLine>, null>) => boolean,
  cwd: string
): string[] {
  return filterBreak(stackLines, (stackLine) => {
    const stack = parseStackLine(stackLine)

    if (!stack || exclude(stack)) return false

    // eslint-disable-next-line functional/immutable-data
    stack.file = relative(cwd, stack.file)
    return chalk.magenta(stringifyStackLine(stack))
  })
}

import { relative } from "path"

import chalk from "chalk"

import { filterBreak } from "../utils/filterBreak"

import { parseStackLine } from "./parseStackLine"
import { stringifyStackLine } from "./stringifyStackLine"

export function filterStack(
  stackLines: string[],
  exclude: (stack: ReturnType<typeof parseStackLine>) => boolean,
  cwd: string
): string[] {
  return filterBreak(stackLines, (stackLine) => {
    const stack = parseStackLine(stackLine)

    if (exclude(stack)) return false

    // eslint-disable-next-line functional/immutable-data
    stack.file = relative(cwd, stack.file)
    return chalk.magenta(stringifyStackLine(stack))
  })
}

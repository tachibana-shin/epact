import chalk from "chalk"
import { cwd } from "process"

import { ErrorNoWatashi } from "../ErrorNoWatashi"
import { filterStack } from "../helpers/filterStack"

// find code breaker
function findCodeBreaker(array: string[], startLine: number): number {
  // eslint-disable-next-line functional/no-let
  let i = startLine
  while (i < array.length) {
    if (/^\w+:/i.test(array[i])) return i

    i++
  }
  return -1
}
const rLineBreakColumn = /^[\s^]+$/
// find column error
function findColumnError(array: string[], startLine: number): number {
  // eslint-disable-next-line functional/no-let
  let i = startLine
  while (i < array.length) {
    if (rLineBreakColumn.test(array[i])) return i

    i++
  }
  return -1
}

export function parseTypeError(messageError: string): ErrorNoWatashi | null {
  const messageSplitted = messageError.split("\n")

  const [file, line] = messageSplitted[0].split(":")
  if (!file || !line) return null

  const lineInfoColumn = findColumnError(messageSplitted, 1)
  if (lineInfoColumn === -1) return null

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const rg = messageSplitted[lineInfoColumn].match(/\^+/)
  if (!rg) return null

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const [column, length] = [rg.index! + 1, rg[0].length]

  const lineInfoTypeError = findCodeBreaker(messageSplitted, lineInfoColumn)
  if (lineInfoColumn === -1) return null

  const [name, message] = messageSplitted[lineInfoTypeError].split(": ", 2)

  const stack = filterStack(
    messageSplitted.slice(lineInfoTypeError + 1),
    (stack) => stack.file.includes("/express/"),
    cwd()
  ).join("\n")

  return new ErrorNoWatashi(name, message, stack, {
    line: +line,
    length,
    column,
    file,
    text: message
  })
}

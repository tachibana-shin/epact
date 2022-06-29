// parse stack
const rLineStack = /^\s{4}at ([^(]+) \((.+)\)$/
export function parseStackLine(line: string) {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const t = line.match(rLineStack)!

  const [, name, path] = t
  const [file, lineNumber, column] = path.split(":")
  return {
    name,
    file,
    line: +lineNumber,
    column: +column
  }
}

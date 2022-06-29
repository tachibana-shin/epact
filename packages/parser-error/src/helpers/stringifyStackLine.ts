import type { parseStackLine } from "./parseStackLine"

export function stringifyStackLine(
  stack: ReturnType<typeof parseStackLine>
): string {
  if (!stack) return ""

  return `    at ${stack.name} (${stack.file}:${stack.line}:${stack.column})`
}

import { readFileSync } from "fs"
import { extname, relative } from "path"

import chalk from "chalk"
import { highlight } from "cli-highlight"

export class ErrorNoWatashi extends Error {
  constructor(
    name: string,
    message: string,
    stack: string,
    options?: {
      line: number
      length: number
      column: number
      file: string
      text?: string
    },
    extend?: object
  ) {
    super(message)

    // eslint-disable-next-line functional/no-let
    let syntaxError
    if (options /* message.startsWith("Transform failed with 1 error:") */) {
      const { line, length, column, file } = options // extend.errors[0].location
      if (length > 0) {
        syntaxError = chalk.grey(
          `${name}: ${relative(process.cwd(), file)}:${line}:${column}:\n`
        )

        const linesCode = readFileSync(file, "utf8").split("\n", line)

        const sizeWidthNumberLine = line.toString().length
        syntaxError +=
          highlight(
            linesCode.slice(Math.max(line - 1 - 2, 0), line).join("\n"),
            {
              language: extname(file).replace(/^\./, ""),
              ignoreIllegals: true
            }
          )
            .split("\n")
            .map((lineText, i) => {
              const indexLine = Math.max(1, line - 2 + i)
              return `${chalk.grey(indexLine)} ${" ".repeat(
                Math.max(0, sizeWidthNumberLine - indexLine.toString().length)
              )}| ${lineText}`
            })
            .join("\n") + "\n"

        syntaxError += `${" ".repeat(sizeWidthNumberLine + 1)}|${" ".repeat(
          column
        )}${"^".repeat(length)}\n`

        const errorInfo = message.split("\n")[1]
        const syntax =
          errorInfo?.slice(errorInfo.indexOf("ERROR:") + 7) || message

        const offsetCenter = column + sizeWidthNumberLine + 2
        syntaxError += chalk.red(
          `${" ".repeat(
            Math.max(0, offsetCenter - Math.ceil(syntax.length / 2) - 1)
          )}${syntax}`
        )

        // syntaxError += chalk.grey(`\n    at ${file}:${line}:${column}\n\n`);
      } else {
        const { text } = options // extend.errors[0]
        syntaxError = chalk.red(
          `${name}： ${text}\n    at line ${line} column ${column} at ./${relative(
            process.cwd(),
            file
          )}:${line}:${column}`
        )
        syntaxError += chalk.cyanBright(`\n    at ${file}:${line}:${column}`)
      }

      syntaxError += "\n    at Readable (node:internal/streams/readable:234:10)"
    }

    if (extend) Object.assign(this, extend)

    // this.name = name
    this.message = message

    // なぜこんなに難しいのですか? 知らないよ、雪笑山が八幡君を乗り越えようとした時のように、こんなことも難しいとは誰も知らなかった。
    // 「${name}:${message}」を使ってみると、${name}を自動的に「エラー·ノワタシ」に交換するザバスクリプトが難しくて、日本語の「:」マークを使ってうまくいくことにしました。
    this.stack = !options
      ? `${chalk.red(`${name}： ${message}`)}\n${stack}\n`
      : `${syntaxError}\n\n${stack}\n`
  }
}

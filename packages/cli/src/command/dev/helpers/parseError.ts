/* eslint-disable camelcase */
import { readFileSync } from "fs"
import { extname, relative } from "path"

import chalk from "chalk"
import { highlight } from "cli-highlight"
// TODO: ばんざいでそ！🙌

class ErrorNoWatashi extends Error {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(name: string, message: string, stack: string, extend: any) {
    super(message)

    // eslint-disable-next-line functional/no-let
    let syntaxError = ""
    if (message.startsWith("Transform failed with 1 error:")) {
      const { line, lineText, length, column, file } = extend.errors[0].location

      if (length > 0) {
        syntaxError += chalk.grey(`Error: ${file}:${line}:${column}:\n`)

        const linesCode = readFileSync(file, "utf8").split("\n")

        process.stdout.write(
          highlight(linesCode.slice(Math.max(line - 2, 0), line).join("\n"), {
            language: extname(file).replace(/^\./, ""),
            ignoreIllegals: true
          })
        )

        syntaxError += `${chalk.grey(line)} | ${highlight(lineText, {
          language: extname(file).replace(/^\./, ""),
          ignoreIllegals: true
        })}\n${" ".repeat(line.toString().length + 1)}|${" ".repeat(
          column
        )}${"^".repeat(length)}\n`

        const errorInfo = message.split("\n")[1]
        const syntax = errorInfo.slice(errorInfo.indexOf("ERROR:") + 7)

        const offsetCenter = column + line.toString().length + 2
        syntaxError += chalk.red(
          `${" ".repeat(
            Math.max(0, offsetCenter - Math.ceil(syntax.length / 2) - 1)
          )}${syntax}`
        )

        // syntaxError += chalk.grey(`\n    at ${file}:${line}:${column}\n\n`);
      } else {
        const { text } = extend.errors[0]
        syntaxError += chalk.red(
          `${name}： ${text}\n    at line ${line} column ${column} at ./${relative(
            process.cwd(),
            file
          )}:${line}:${column}`
        )
        syntaxError += chalk.cyanBright(`\n    at ${file}:${line}:${column}`)
      }
    }

    if (syntaxError === "") Object.assign(this, extend)

    this.name = name
    this.message = message

    // なぜこんなに難しいのですか? 知らないよ、雪笑山が八幡君を乗り越えようとした時のように、こんなことも難しいとは誰も知らなかった。
    // 「${name}:${message}」を使ってみると、${name}を自動的に「エラー·ノワタシ」に交換するザバスクリプトが難しくて、日本語の「:」マークを使ってうまくいくことにしました。
    this.stack =
      syntaxError === ""
        ? `${chalk.red(`${name}： ${message}`)}\n${stack}\n`
        : `${syntaxError}\n${stack}\n`
  }
}

// TODO: ばんざいでそ！🙌
// init();
export default function parseError(
  message: string,
  hiddenESBuild: boolean
): ErrorNoWatashi | null {
  // 4つのスタイルと「at\space」ニューラインディフェンダーの1位。🐱‍👓
  const indexCharNewLineYonSpaceAtSpace = message.indexOf("\n    at ")

  if (indexCharNewLineYonSpaceAtSpace < 1) return null

  const messageErrorChunk = message
    .slice(0, indexCharNewLineYonSpaceAtSpace)
    .match(/(^[^\s]+): ((?:.|\s)+)$/)

  if (!messageErrorChunk) return null

  //     ,エラー·スタイル、エラー初期化引数
  const [, typeError /**/, errorInitialArgument = ""] = messageErrorChunk

  const infoError = message.slice(indexCharNewLineYonSpaceAtSpace + 1) // 最初の改行を必要としない (^\n)

  // 今は推理力を高めるために「探偵コナン」を見ている

  // の最後の行には、エラーファイル情報とJSON解析の開いた括弧が含まれています
  const execCharAtSpace_UrlError_OpenBracket = /\n(?: {4})at [^\n]+ {/.exec(
    infoError
  )

  if (!execCharAtSpace_UrlError_OpenBracket) {
    // エラーJSON情報はありません。

    // console.log("エラーJSON情報はありません。");
    return new ErrorNoWatashi(typeError, errorInitialArgument, infoError, {})
  } else {
    const {
      index: indexCharAtSpace_UrlError_OpenBracket,
      0: { length: adjustIndex }
    } = execCharAtSpace_UrlError_OpenBracket

    // ファイルにエラーが発生しました。
    const anErrorOccurredInTheFile = infoError.slice(
      0,
      indexCharAtSpace_UrlError_OpenBracket
    )

    const jsonError = parseStringObject(
      infoError.slice(indexCharAtSpace_UrlError_OpenBracket + adjustIndex - 1)
    )
    return new ErrorNoWatashi(
      typeError,
      errorInitialArgument,
      filterESbuildTrace(anErrorOccurredInTheFile, hiddenESBuild),
      jsonError
    )
  }
}

function parseStringObject(str: string) {
  try {
    // eslint-disable-next-line no-useless-call, no-new-func
    return new Function(
      "window",
      "document",
      "global",
      "globalThis",
      "self",
      `return ${str}`
      // eslint-disable-next-line no-void
    ).call(void 0)
  } catch {
    return {
      message: str
    }
  }
}

function filterESbuildTrace(trace: string, hidden: boolean): string {
  const newTraceArray: string[] = []
  // eslint-disable-next-line functional/no-let
  let esbuildTraceNow = ""

  trace
    .split("\n")
    .reverse()
    .forEach((lineAt) => {
      const isESBuild = /esbuild\/lib\/main\.js:\d+:\d+\)?$/.test(lineAt)

      if (isESBuild) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const offsetError = lineAt.match(/(:\d+:\d+)\)?$/)![1]!.slice(1)

        if (!hidden) esbuildTraceNow += ` -> ${offsetError}`
      } else {
        if (esbuildTraceNow !== "") {
          newTraceArray.push(chalk.grey(`    at esbuild${esbuildTraceNow}`))

          esbuildTraceNow = ""
        }
        newTraceArray.push(lineAt)
      }
      // console.log(esbuildTraceNow)
    })

  if (esbuildTraceNow !== "")
    newTraceArray.push(chalk.grey(`    at esbuild${esbuildTraceNow}`))

  return newTraceArray.reverse().join("\n")
}

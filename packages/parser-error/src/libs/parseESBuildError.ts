/* eslint-disable camelcase */
import { cwd } from "process"

import chalk from "chalk"

import { ErrorNoWatashi } from "../ErrorNoWatashi"
import { filterStack } from "../helpers/filterStack"

// TODO: ばんざいでそ！🙌
// init();
export function parseESBuildError(message: string): ErrorNoWatashi | null {
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
    return new ErrorNoWatashi(typeError, errorInitialArgument, infoError)
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
    const isTransformError = errorInitialArgument.startsWith(
      "Transform failed with 1 error:"
    ) // トランスフォームエラー
    return new ErrorNoWatashi(
      typeError,
      errorInitialArgument,
      filterStack(
        anErrorOccurredInTheFile.split("\n"),
        (stack) => stack.file.includes("/esbuild/"),
        cwd()
      ).join("\n"),
      isTransformError
        ? {
            ...jsonError.errors[0].location,
            text: jsonError.errors[0].text
          }
        : undefined,
      isTransformError ? undefined : jsonError
    )
  }
}

function parseStringObject(str: string) {
  str = str
    .replace(/\[Function \w+\]/g, (search) => {
      return chalk.blue(search)
    })
    .replace(/warnings: \[\]/g, "warnings: []")
    .trim()
    .replace(/Node\.js v[\d.]+$/, "")

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

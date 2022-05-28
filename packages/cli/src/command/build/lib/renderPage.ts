import { join, relative } from "path"

import { globbySync } from "globby"

import parsePathRoute from "../utils/parsePathRoute"
import toVarName from "../utils/toVarName"
import type { DefineConfig } from "../../../../../epact/src"

export default function renderPage(
  { routes, strict }: DefineConfig["router"],
  baseUrl = "/"
) {
  const pages: {
    readonly name: string
    readonly filename: string
  }[] = []
  return `${globbySync([
    "src/pages/**/*.ts",
    "!*/\\!*/*",
    "!*/**/*.test.*",
    "!*/**/*.spec.*",
    "!*/__test__/*"
  ])
    .map((filename) => {
      const finder = relative("src/pages", filename)

      const replacer =
        // eslint-disable-next-line arrow-parens
        routes?.find((route) => route.find === finder)?.replacement ?? finder

      const name = `page__${toVarName(join(baseUrl, filename))}`
      pages.push({ name, filename: replacer })
      return `import ${name} from "../${filename}";`
    })
    .join("\n")}
import { createPage } from "epact";

${pages
  .map(({ name, filename }) => {
    return `app.use("/", createPage("${join(
      baseUrl,
      parsePathRoute(filename, { strict })
    )}", ${name}).router);`
  })
  .join("\n")}
`
}

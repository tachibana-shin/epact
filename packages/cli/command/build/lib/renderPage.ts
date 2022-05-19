import { globbySync } from "globby";
import { relative } from "path";
import parsePrefixRouter from "../../../../core/utils/parsePrefixRouter";
import toVarName from "../utils/toVarName";

export default function renderPage(
  routes?: {
    find: string;
    replacement: string;
  }[]
) {
  const pages: {
    name: string;
    filename: string;
  }[] = [];
  return (
    globbySync("src/pages/**/*.ts")
      .map((filename) => {
        const finder = relative("src/pages", filename);

        const replacer =
          routes?.find((route) => route.find === finder)?.replacement ?? finder;

        const name = "page__" + toVarName(filename);
        pages.push({ name, filename: replacer });
        return `import ${name} from "../${filename}";`;
      })
      .join("\n") +
    `
import { createPage } from "express-fw-next";

${pages
  .map(({ name, filename }) => {
    return `app.use("/", createPage("${parsePrefixRouter(
      filename
    )}", ${name}).router);`;
  })
  .join("\n")}
`
  );
}
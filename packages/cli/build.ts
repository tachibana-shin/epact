/* eslint-disable functional/immutable-data */
/* eslint-disable functional/prefer-readonly-type */
import fs, { existsSync, mkdirSync } from "fs";
import path, { join } from "path";

import { globbySync } from "globby";
import { build } from "tsup";

function toVarName(filename: string) {
  return filename.replace(/[^a-zA-Z0-9_$]/g, "_");
}

// eslint-disable-next-line functional/no-return-void
export default function (): void {
  const pathToDir = process.cwd();

  // load express.config.js
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const config = require(join(pathToDir, "express.config.js")).default;

  const pages: { name: string; filename: string }[] = [];
  // eslint-disable-next-line functional/no-let
  let code = `
import express from "express"

const app = express();
`;

  // load boots;
  const bootNames: string[] = [];
  code += `
${config.boot
  ?.map((bootName: string) => {
    const name = "boot__" + toVarName(bootName);
    bootNames.push(name);
    return `import * as ${name} from "../src/boot/${bootName}"`;
  })
  .join("\n")}
`;
  code += `
import { createBoot } from "express-fw-next/dist/core"

[...createBoot(app, ${bootNames.join(
    "), ...createBoot(app, "
  )})].forEach(boot => {
  app.use(boot)
})
`;

  globbySync("src/pages/**/*.ts").forEach((filename) => {
    const name = "page__" + filename.replace(/[^a-zA-Z0-9_$]/g, "_");
    pages.push({ name, filename });
    code += `import ${name} from "../${filename}";\n`;
  });

  code += `
import { createPage } from "express-fw-next/dist/core";

${pages
  .map(({ name, filename }) => {
    return `app.use("/", createPage("${path.relative(
      "src/pages",
      filename
    )}", ${name}).router);`;
  })
  .join("\n")}
`;

  code += `app.listen(3000, () => {
  console.log("App is running at port 3000")
})`;

  if (!existsSync(join(pathToDir, ".express"))) {
    mkdirSync(join(pathToDir, ".express"));
  }

  fs.writeFileSync(join(pathToDir, ".express/main.ts"), code);

  build({
    entry: [join(pathToDir, ".express/main.ts")],
  });
}

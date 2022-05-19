import toVarName from "../utils/toVarName";

export default function renderBoot(boot?: string[]) {
  // load boots;
  const bootNames: string[] = [];
  return (
    `
${boot
  ?.map((bootName) => {
    const name = "boot__" + toVarName(`src/boot/${bootName}`);
    bootNames.push(name);
    return `import * as ${name} from "../src/boot/${bootName}"`;
  })
  .join("\n")}
` +
    `
import { createBoot } from "express-fw-next"

[...createBoot(app, ${bootNames.join(
      "), ...createBoot(app, "
    )})].forEach(boot => {
  app.use(boot)
})
`
  );
}

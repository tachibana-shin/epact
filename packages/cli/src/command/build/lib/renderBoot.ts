import type { DefineConfig } from "../../../../../epact"
import toVarName from "../utils/toVarName"

export default function renderBoot(
  boot: DefineConfig["boot"] = void 0,
  isDev: boolean
) {
  // load boots;
  const bootNames: string[] = []
  return (
    `
${boot
  ?.map((bootOption) => {
    let bootName: string, inDev: boolean | void, inProd: boolean | void
    if (typeof bootOption === "string") {
      bootName = bootOption
    } else {
      bootName = bootOption.name
      inDev = bootOption.isDev
      inProd = bootOption.isProd
    }

    if (inDev ? isDev : inProd ? !isDev : true) {
      const name = `boot__${toVarName(`src/boot/${bootName}`)}`
      bootNames.push(name)
      return `import * as ${name} from "../src/boot/${bootName}"`
    }

    return void 0
  })
  .filter(Boolean)
  .join("\n")}
` +
    `
import { createBoot } from "epact"

[...createBoot(app, ${bootNames.join(
      "), ...createBoot(app, "
    )})].forEach(boot => {
  app.use(boot)
})
`
  )
}

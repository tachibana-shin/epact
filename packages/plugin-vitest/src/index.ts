import { join } from "path"

import type { Plugin } from "vite"
import vitestTsconfigPaths from "vitest-tsconfig-paths"

export default function pluginVitest(): readonly Plugin[] {
  const epactApp = join(process.cwd(), ".express/main")

  return [
    {
      name: "virual:epact-app", // required, will show up in warnings and errors
      resolveId(id) {
        if (id === "virual:app" || id === "epact:app") return epactApp
      }
    },
    vitestTsconfigPaths()
  ]
}

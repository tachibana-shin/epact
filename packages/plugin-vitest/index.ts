import vitestTsconfigPaths from "vitest-tsconfig-paths";
import { Plugin } from "vite";
import { join } from "path";

export default function pluginVitest(): Plugin[] {
  const epactApp = join(process.cwd(), ".express/main");

  return [
    {
      name: "virual:epact-app", // required, will show up in warnings and errors
      resolveId(id) {
        if (id === "virual:app" || id === "epact:app") {
          return epactApp;
        }
      },
    },
    vitestTsconfigPaths(),
  ];
}

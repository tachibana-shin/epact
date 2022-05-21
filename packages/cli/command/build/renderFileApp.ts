import { existsSync, mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import { defineConfig } from "../../../core";
import renderApp from "./lib/renderApp";
import renderBoot from "./lib/renderBoot";
import renderListenApp from "./lib/renderListenApp";
import renderPage from "./lib/renderPage";

export default function renderFileApp(
  config: ReturnType<typeof defineConfig>,
  devMode: boolean,
  forceSystemless?: true
) {
  const pathToDir = process.cwd();

  const code =
    renderApp() +
    renderBoot(config.boot) +
    renderPage(config.router?.routes, config.baseUrl) +
    renderListenApp(
      devMode
        ? config.port ?? 3000
        : /* build mode */ forceSystemless
        ? false
        : config.build?.port ?? config.port ?? 3000
    ) +
    "\nexport default app;";

  if (!existsSync(join(pathToDir, ".express"))) {
    mkdirSync(join(pathToDir, ".express"));
  }

  writeFileSync(
    join(pathToDir, `.express/${config.filename ?? "main.ts"}`),
    code
  );
}

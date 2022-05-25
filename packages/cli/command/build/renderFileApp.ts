import { existsSync, mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import { defineConfig } from "../../../core";
import renderApp from "./lib/renderApp";
import renderBoot from "./lib/renderBoot";
import renderCatchError from "./lib/renderCatchError";
import renderListenApp from "./lib/renderListenApp";
import renderPage from "./lib/renderPage";
import renderPublic from "./lib/renderPublic";

export default function renderFileApp(
  config: ReturnType<typeof defineConfig>,
  devMode: boolean,
  forceSystemless?: true
) {
  const pathToDir = process.cwd();

  const code =
    renderApp() +
    renderBoot(config.boot) +
    (config.prePublic ? renderPublic(config, devMode, pathToDir) : "") +
    renderPage(config.router?.routes, config.baseUrl) +
    renderCatchError(devMode) +
    renderListenApp(
      devMode
        ? config.port ?? 3000
        : /* build mode */ forceSystemless
        ? false
        : config.build?.port ?? config.port ?? 3000,
        devMode
    ) +
    (config.prePublic ? "" : renderPublic(config, devMode, pathToDir)) +
    "\nexport default app;";

  if (!existsSync(join(pathToDir, ".express"))) {
    mkdirSync(join(pathToDir, ".express"));
  }

  writeFileSync(
    join(pathToDir, `.express/${config.filename ?? "main.ts"}`),
    code
  );
}

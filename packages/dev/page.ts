import path, { relative } from "path";

import { Express, Router } from "express";
import { globbySync } from "globby";

import { error } from "../helpers/log";
import rootConfigs from "../helpers/root-configs";
import loadModule from "../utils/loadModule";

import createPage from "./createPage";

function loadAllRoutes(srcToRoutes: string) {
  const files = globbySync([
    path.join(srcToRoutes, "**/*.{ts,js}"),
    "!*/\\!*/*",
  ]);

  return (
    files
      .map((file) => {
        const { error: err, exported } = loadModule<
          {
            // eslint-disable-next-line functional/prefer-readonly-type, @typescript-eslint/no-explicit-any
            middleware: any;
          },
          Record<string, unknown> | Router
        >(file);

        if (err) {
          error(err);
          return void 0;
        }

        return createPage(relative(srcToRoutes, file), exported);
      })
      // eslint-disable-next-line functional/prefer-readonly-type
      .filter(Boolean) as {
      // eslint-disable-next-line functional/prefer-readonly-type
      router: Router;
      // eslint-disable-next-line functional/prefer-readonly-type
      prefix: string;
    }[]
  );
}
export function usePage(app: Express, appRoot: string): Router {
  const url = path.join(appRoot, "pages");

  const routes = loadAllRoutes(url);

  routes.forEach(({ router }) => {
    app.use("/", router);
  });

  rootConfigs.router?.extendRoutes?.(app, routes);

  return app;
}

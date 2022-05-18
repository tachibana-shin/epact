import { join } from "path";

import { Express, Router } from "express";

import { error, warn } from "../helpers/log";
import rootConfigs from "../helpers/root-configs";
import loadModule from "../utils/loadModule";

import createBoot from "./createBoot";

export function useBoot(app: Express, appRoot: string): Router {
  const url = join(appRoot, "boot");

  rootConfigs.boot?.forEach((bootName) => {
    const pathJoined = join(url, bootName);

    try {
      // load
      const {
        error: err,
        exported: { default: exported },
      } = loadModule(pathJoined);

      if (err) {
        error(err);
        return;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      createBoot(app, exported as any).forEach((boot) => app.use(boot));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      warn(`Can't find boot "${bootName}"`);
    }
  });

  return app;
}

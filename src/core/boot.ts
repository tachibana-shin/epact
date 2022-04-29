import { join } from "path";

import { Express, Router } from "express";

import { error, warn } from "../helpers/log";
import rootConfigs from "../helpers/root-configs";
import TypesForRequestHandlerParams, {
  RequestHandlerFlatParams,
} from "../type/TypesForRequestHandlerParams";
import loadModule from "../utils/loadModule";

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

      if (typeof exported !== "function") {
        return; // no export
      }

      const plugins =
        exported.length >= 3 ? exported : exported({ router: app });

      if (Array.isArray(plugins)) {
        plugins.forEach((plugin) => {
          app.use(plugin);
        });
      } else {
        app.use(plugins);
      }
    } catch (err) {
      if (err.code === "ENOENT") {
        warn(`Can't find boot "${bootName}"`);
      }
    }
  });

  return app;
}

type BootCallback<
  Params extends Partial<Record<keyof TypesForRequestHandlerParams, unknown>>
> = (app: {
  // eslint-disable-next-line functional/prefer-readonly-type
  router: Router;
}) => RequestHandlerFlatParams<Params>;

export function boot<
  Params extends Partial<Record<keyof TypesForRequestHandlerParams, unknown>>
>(callback: BootCallback<Params>): BootCallback<Params> {
  return callback;
}

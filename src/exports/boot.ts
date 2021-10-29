import fs from "fs";
import path from "path";

import appRoot from "app-root-path";
import { Express, RequestHandler, Router } from "express";

import { error, warn } from "../helpers/log";
import rootConfigs from "../helpers/root-configs";
import { requireModule } from "../utils/requireModule";

export function useBoot(app?: Express): Router {
  const url = path.resolve(appRoot, "src/boot");

  const router = app || Router();

  rootConfigs.boot?.forEach((child) => {
    const pathJoined = path.join(url, child);

    try {
      if (fs.lstatSync(pathJoined).isFile()) {
        // load
        const { error: err, message, module } = requireModule(pathJoined);

        if (err) {
          error(message);
        } else {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          router.use((module as any)?.({ router }));
        }
      }
    } catch (err) {
      if (err.code === "ENOENT") {
        warn(`Can't find boot "${child}"`);
      }
    }
  });

  return router;
}

export function boot(
  cb: (app: { readonly router: Router }) => RequestHandler | void
) {
  return cb;
}

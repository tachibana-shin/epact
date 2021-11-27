import fs from "fs";
import { join } from "path";

import { Express, RequestHandler, Router } from "express";

import { error, warn } from "../helpers/log";
import rootConfigs from "../helpers/root-configs";
import { requireModule } from "../utils/requireModule";

function useBoot(app: Express, appRoot: string): Router {
  const url = join(appRoot, "boot");

  rootConfigs.boot?.forEach((child) => {
    const pathJoined = join(url, child);

    try {
      if (fs.lstatSync(pathJoined).isFile()) {
        // load
        const { error: err, message, module } = requireModule(pathJoined);

        if (err) {
          error(message);
        } else {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const plgs = (module as any)?.({ router: app });
          
          if (Array.isArray(plgs)) {
            plgs.forEach(plg => void app.use(plg));
          } else {
            app.use(plgs);
          }
        }
      }
    } catch (err) {
      if (err.code === "ENOENT") {
        warn(`Can't find boot "${child}"`);
      }
    }
  });

  return app;
}

function boot(cb: (app: { readonly router: Router }) => RequestHandler | readonly RequestHandler[] | void) {
  return cb;
}

export { useBoot, boot };

import fs from "fs";
import path from "path";

import appRoot from "app-root-path";
import { RequestHandler, Router } from "express";

import { error } from "../helpers/log";
import { requireModule } from "../utils/requireModule";

export function useBoot(url = "src/boot"): Router {
  url = path.resolve(appRoot, url);

  const router = Router();

  fs.readdirSync(url).map((child) => {
    const pathJoined = path.join(url, child);

    if (fs.lstatSync(pathJoined).isFile()) {
      // load
      const { error: err, message, module } = requireModule(pathJoined);

      if (err) {
        error(message);
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        router.use((module as any)?.());
      }
    }
  });

  return router;
}

export function boot(cb: () => RequestHandler | void) {
  return cb;
}

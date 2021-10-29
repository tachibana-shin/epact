import express, { Express } from "express";

import { useBoot, useRouter } from "..";
import { warn } from "../helpers/log";

// eslint-disable-next-line functional/no-let
let app: Express;
export function createApp(): Express {
  if (!app) {
    app = express();

    // install boot
    useBoot(app);
    // install router & middleware
    useRouter(app);
  } else {
    warn("Can't initial app because app is exists.");
  }

  return app;
}

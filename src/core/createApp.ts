import express, { Express } from "express";

import { warn } from "../helpers/log";
import rootConfigs from "../helpers/root-configs";

import { useBoot } from "./boot";
import { usePage } from "./page";

// eslint-disable-next-line functional/no-let
let app: Express;
export function createApp(port = rootConfigs.port || 3000): Express {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const appRoot = require.main!.path; //

  if (!app) {
    app = express();

    // install boot
    useBoot(app, appRoot);
    // install router & middleware
    usePage(app, appRoot);
    // install plugins
    rootConfigs.plugins?.forEach((plugin) => {
      plugin(app, appRoot);
    });

    app.listen(port, () => {
      console.log(`⚡️ App it running on port ${port}`);
    });
  } else {
    warn("Can't initial app because app is exists.");
  }

  return app;
}

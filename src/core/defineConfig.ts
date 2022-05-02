/* eslint-disable functional/prefer-readonly-type */
import { join } from "path";

import type { Express, Router } from "express";
import alias from "module-alias";

export type DefineConfig = {
  port?: number;
  boot?: string[];
  alias?:
    | Record<
        string,
        string | ((from: string, request: string, alias: string) => string)
      >
    | {
        find: string;
        replacement:
          | string
          | ((from: string, request: string, alias: string) => string);
      }[];
  paths?: string[];
  router?: {
    extendRoutes?: (
      app: Express,
      routes: {
        router: Router;
        prefix: string;
      }[]
      // eslint-disable-next-line functional/no-return-void
    ) => void;
  };
  // eslint-disable-next-line functional/no-return-void
  plugins?: ((app: Express, appRoot: string) => void)[];
};

export default function defineConfig(config: DefineConfig) {
  if (require.main === undefined) {
    // eslint-disable-next-line functional/no-throw-statement
    throw new Error("Can't run express-fw in repl!");
  }

  const appRoot = require.main.path;

  config.paths?.forEach((path) => {
    alias.addPath(path);
  });
  if (Array.isArray(config.alias)) {
    config.alias.forEach(({ find, replacement }) => {
      if (typeof replacement === "function") {
        alias.addAlias(find, ((from: string, request: string) => {
          // eslint-disable-next-line @typescript-eslint/ban-types
          return join(appRoot, (replacement as Function)(from, request));
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        }) as any);
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        alias.addAlias(find, join(appRoot, replacement as any));
      }
    });
  } else {
    // eslint-disable-next-line functional/no-loop-statement
    for (const find in config.alias) {
      const replacement = config.alias[find];

      if (typeof replacement === "function") {
        alias.addAlias(find, ((from: string, request: string) => {
          // eslint-disable-next-line @typescript-eslint/ban-types
          return join(appRoot, (replacement as Function)(from, request));
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        }) as any);
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        alias.addAlias(find, join(appRoot, replacement as any));
      }
    }
  }

  return config as Omit<DefineConfig, "alias" | "paths">;
}

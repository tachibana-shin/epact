/* eslint-disable functional/prefer-readonly-type */
import { join } from "path";

import type { Express, Router } from "express";
import type alias from "module-alias";
type Alias = typeof alias;

export type DefineConfig = {
  port?: number;
  boot?: string[];
  alias?: // eslint-disable-next-line functional/no-return-void
  | ((aliases: Alias) => void)
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

export default function defineConfig(config: DefineConfig, appRoot: string) {
  const { alias: aliases } = config;
  function __bindAlias(alias: Alias) {
    config.paths?.forEach((path) => {
      alias.addPath(path);
    });

    if (!aliases) return;
    if (typeof aliases === "function") {
      aliases(alias);
      return;
    }

    if (Array.isArray(aliases)) {
      aliases.forEach(({ find, replacement }) => {
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
      for (const find in aliases) {
        const replacement = aliases[find];

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
  }
  // eslint-disable-next-line functional/immutable-data
  config.alias = __bindAlias;

  return config as Omit<DefineConfig, "alias" | "paths">;
}

/* eslint-disable functional/prefer-readonly-type */
import { join } from "path";

import type { Express, Router } from "express";
import type alias from "module-alias";
import { Format, Options } from "tsup";
type Alias = typeof alias;

export type DefineConfig = {
  filename?: string;
  port?: number;
  boot?: string[];
  env?: {
    [name: string]: string;
  };
  define?:  {
    [name: string]: string;
  }
  loader?: Options["loader"]
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
    routes?: {
      find: string;
      replacement: string;
    }[];
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


  build?: {
    systemless?: boolean;
    watch?: boolean;
    outDir?: string;
    format: Format | Format[];
    noMinify?: boolean;
    keepNames?: boolean;
    target?: string;
    sourcemap?: false | "inline"
    ignoreWatch?: string | string[];
    onSuccess?: string;
    env?: {
      [name: string]: string;
    }
    inject?: string[];
    define?:  {
      [name: string]: string;
    }
    external?: string[]
    jsxFactory?: string;
    jsxFragment?: string;
    noSplitting?: boolean;
    silent?: boolean;
    metafile?: boolean;
  }
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

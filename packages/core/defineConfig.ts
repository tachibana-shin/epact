/* eslint-disable functional/prefer-readonly-type */

import { Format, Options } from "tsup";

export type DefineConfig = {
  baseUrl?: string;
  filename?: string;
  port?: number;
  boot?: string[];
  env?: {
    [name: string]: string;
  };
  define?: {
    [name: string]: string;
  };
  loader?: Options["loader"];
  router?: {
    routes?: {
      find: string;
      replacement: string;
    }[];
  };

  build?: {
    port?: string | number | false;
    systemless?: boolean;
    watch?: boolean;
    outDir?: string;
    format: Format | Format[];
    noMinify?: boolean;
    keepNames?: boolean;
    target?: string;
    sourcemap?: false | "inline";
    ignoreWatch?: string | string[];
    onSuccess?: string;
    env?: {
      [name: string]: string;
    };
    inject?: string[];
    define?: {
      [name: string]: string;
    };
    external?: string[];
    jsxFactory?: string;
    jsxFragment?: string;
    noSplitting?: boolean;
    silent?: boolean;
    metafile?: boolean;
  };
};

export default function defineConfig(config: DefineConfig) {
  return config;
}

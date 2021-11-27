import fs from "fs";
import path from "path";

import { path as rootPath } from "app-root-path";
import { Router } from "express";

type Configs = {
  readonly port: string;
  readonly router: {
    // eslint-disable-next-line functional/no-return-void
    readonly extendRoutes: (router: Router) => void;
  };
  readonly boot: readonly string[];
};

// eslint-disable-next-line functional/no-let
let configs = {};

function existsFileConfig(name: string): boolean {
  try {
    return fs.lstatSync(path.join(rootPath, name)).isFile();
  } catch {
    return false;
  }
}

if (existsFileConfig("express.config.json")) {
  // load..
  configs = JSON.parse(
    fs.readFileSync(path.join(rootPath, "express.config.json"), "utf8")
  );
} else if (existsFileConfig("express.config.js")) {
  configs = require(path.join(rootPath, "express.config.js"));
} else if (existsFileConfig("express.config.ts")) {
  configs = require(path.join(rootPath, "express.config.ts"));
}

export default configs as Partial<Configs>;

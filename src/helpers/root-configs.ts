import fs from "fs";
import path from "path";

import { path as rootPath } from "app-root-path";

import defineConfig from "../core/defineConfig";

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
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  configs = require(path.join(rootPath, "express.config.js")).default;
} else if (existsFileConfig("express.config.ts")) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  configs = require(path.join(rootPath, "express.config.ts")).default;
}

export default configs as ReturnType<typeof defineConfig>;

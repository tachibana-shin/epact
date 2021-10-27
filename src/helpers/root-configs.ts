import fs from "fs";
import path from "path";

import rootPath from "app-root-path";

import { Configs } from "..";

// eslint-disable-next-line functional/no-let
let configs = {};

function existsFileConfig(name: string): boolean {
  try {
    return fs.lstatSync(path.join(rootPath, name)).isFile();
  } catch {
    return false;
  }
}

if (existsFileConfig("express-fs.config.json")) {
  // load..
  configs = JSON.parse(
    fs.readFileSync(path.join(rootPath, "express-fs.config.json"), "utf8")
  );
} else if (existsFileConfig("express-fs.config.js")) {
  configs = require(path.join(rootPath, "express-fs.config.js"));
} else if (existsFileConfig("express-fs.config.ts")) {
  configs = require(path.join(rootPath, "express-fs.config.ts"));
}

export default configs as Partial<Configs>;

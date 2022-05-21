#!/bin/env node
import { program } from "commander";

import build from "./command/build";
import dev from "./command/dev";
import upgrade from "./command/upgrade";

program
  .command("build")
  .description("build app express-fw")
  .option("-sl, --systemless", "build for systemless")
  .option(
    "-w, --watch [path]",
    // eslint-disable-next-line quotes
    'Watch mode, if path is not specified, it watches the current folder ".". Repeat "--watch" for more than one path'
  )
  .option("-d, --out-dir <dir>", "Output directory", "dist")
  // eslint-disable-next-line quotes
  .option("--format <format>", 'Bundle format, "cjs", "esm"', "cjs")
  .option("--no-minify", "Turn off minify")
  .option(
    "--keep-names",
    "Keep original function and class names in minified code"
  )
  // eslint-disable-next-line quotes
  .option("--target <target>", 'Bundle target, "es20XX" or "esnext"', "node16")
  .option(
    "--sourcemap [inline]",
    "Generate external sourcemap, or inline source: --sourcemap inline"
  )
  .option("--ignore-watch <path>", "Ignore custom paths in watch mode")
  .option(
    "--onSuccess <command>",
    "Execute command after successful build, specially useful for watch mode"
  )
  .option("--env.* <value>", "Define compile-time env variables")
  .option(
    "--inject <file>",
    "Replace a global variable with an import from another file"
  )
  .option("--define.* <value>", "Define compile-time constants")
  .option("--external <name>", "Mark specific packages as external")
  .option(
    "--jsxFactory <jsxFactory>",
    "Name of JSX factory function",
    "React.createElement"
  )
  .option(
    "--jsxFragment <jsxFragment>",
    "Name of JSX fragment function",
    "React.Fragment"
  )
  .option("--no-splitting", "Disable code splitting")

  .option(
    "--silent",
    // eslint-disable-next-line quotes
    'Suppress non-error logs (excluding "onSuccess" process output)'
  )
  .option("--pure <express>", "Mark specific expressions as pure")
  .option("--metafile", "Emit esbuild metafile (a JSON file)")
  .option("--platform <platform>", "Target platform", "node")
  .option("-dg, --debug", "Enable mode debug. Build sourcemap and no minify")
  .action((options) => {
    if (typeof options.format === "string") {
      // eslint-disable-next-line functional/immutable-data
      options.format = options.format.split(",").filter(Boolean);
    }
    const env: Record<string, string> = {};

    // eslint-disable-next-line functional/no-loop-statement
    for (const prop in options) {
      if (prop.startsWith("env.")) {
        // eslint-disable-next-line functional/immutable-data
        env[prop.slice(prop.indexOf("env.") + 4)] = options[prop];
      }
    }

    build({
      systemless: options.systemless ?? false,
      ...options,
      env: {
        NODE_ENV: "production",
        ...env,
      },
      buildMode: true,
    });
  });
program
  .command("dev")
  .description("Start app in development debug")
  .action(() => {
    dev();
  });
program
  .command("upgrade")
  .description("Upgrade express-fw")
  .option("-i, --install", "Check update and install last version")
  .action(({ install }) => {
    upgrade(install);
  });

program.parse();

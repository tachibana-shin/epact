import { existsSync } from "fs";
import { DefineConfig } from "../../../../core";
import fs from "fs-extra";
import { join } from "path";
export default function renderPublic(
  config: DefineConfig,
  devMode: boolean,
  cwd: string
) {
  const publicDir = cwd + "/public";

  if (devMode) return `app.use(express.static("../public"))`;

  if (!existsSync(publicDir)) return "";

  fs.copySync(publicDir, join(cwd, config.build?.outDir || "dist", "public"), {
    recursive: true,
  });

  return `app.use(express.static("./public"))`;
}

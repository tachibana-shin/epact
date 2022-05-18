import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["packages/core/index.ts", "packages/cli/index.ts"],
  clean: true,
  format: ["cjs", "esm"],
  dts: true,
  splitting: true,
  target: "node16",
});

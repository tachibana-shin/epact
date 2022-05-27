import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["packages/core/index.ts", "packages/cli/index.ts", "packages/plugin-vitest/index.ts"],
  clean: true,
  format: ["cjs", "esm"],
  dts: true,
  splitting: true,
  target: "node16",
});

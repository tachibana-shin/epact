import { defineConfig } from "tsup"

export default defineConfig({
  entry: ["./src/index.ts", "./src/exports.ts"],
  clean: true,
  format: ["cjs", "esm"],
  dts: true,
  splitting: true,
  target: "node16"
})

import vitestTsconfigPaths from "vitest-tsconfig-paths"
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [vitestTsconfigPaths()]
})

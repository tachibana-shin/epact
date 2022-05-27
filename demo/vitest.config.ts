import epactPluginVitest from "epact/plugin-vitest";
import { defineConfig } from "vitest/config";


export default defineConfig({
  plugins: [epactPluginVitest()],
});

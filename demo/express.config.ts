import path from "path";

import { defineConfig } from "../src";

export default defineConfig({
  port: 3000,
  boot: ["dotenv", "plugins"],
  alias: {
    src: path.join(__dirname, "src"),
  },
});

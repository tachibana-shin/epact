import { defineConfig } from "../src";

export default defineConfig({
  port: 3000,
  boot: ["dotenv", "plugins"],
});

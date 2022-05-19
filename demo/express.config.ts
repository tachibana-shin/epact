import path from "path";

export default {
  port: 3000,
  boot: ["dotenv", "plugins"],
  alias: {
    src: path.join(__dirname, "src"),
  },
  build: {
    watch: true,
  },
};

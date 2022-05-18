const path = require("path")

export default ({
  port: 3000,
  boot: ["dotenv", "plugins"],
  alias: {
    src: path.join(__dirname, "src"),
  },
});

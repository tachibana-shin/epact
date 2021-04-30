const fs = require("fs");
const path = require("path");
const express = require("express");
const chalk = require("chalk");

function requireRouter(id) {
  try {
    return {
      error: false,
      module: require(path.resolve("./", id)),
    };
  } catch (e) {
    return {
      path: require(path.resolve("./", id)),
      error: true,
      message: e,
    };
  }
}

function parseIdRouter(name) {
  name = name.replace(/\.[^.]+$/, "");

  if (name === "_") {
    return "/*";
  }
  if (name === "index") {
    return "/";
  } else {
    return `/${name.replace(/_([a-zA-Z0-9_-]{1,})/g, ":$1")}`;
  }
}

function hasParam(name) {
  return name.includes(":");
}

function readerRoutes(url) {
  return fs
    .readdirSync(url)
    .map((child) => {
      const pathJoined = path.join(url, child);

      if (fs.lstatSync(pathJoined).isDirectory()) {
        const children = readerRoutes(pathJoined);
        const id = parseIdRouter(child);

        let name = id === "/" ? "/index" : `${id}`;

        return children.map((item) => {
          return {
            ...item,
            name: item.name === "/" ? `${name}` : `${name}${item.name}`,
          };
        });
      } else {
        try {
          const id = parseIdRouter(child);

          let name = "";
          if (hasParam(id)) {
            name = `${id}?`;
          } else {
            name = `${id}`;
          }

          return {
            name,
            module: requireRouter(pathJoined),
          };
        } catch (error) {
          throw error;
        }
      }
    })
    .flat(Infinity);
}

const METHODS = [
  "all",
  "checkout",
  "copy",
  "delete",
  "get",
  "head",
  "lock",
  "m-search",
  "merge",
  "mkactivity",
  "mkcol",
  "move",
  "notify",
  "options",
  "patch",
  "post",
  "purge",
  "put",
  "report",
  "search",
  "subscribe",
  "trace",
  "unlock",
  "unsubscribe",
];

function loadRoutes(url = "./routes") {
  const routes = readerRoutes(url);

  const router = express.Router();

  routes.forEach(({ name, module: { path, error, message, module } }) => {
    if (error === true) {
      console.log(chalk.red(`Module "${name}" from "${path}" error:`));
      console.error(message);
    } else {
      if (module?.constructor === express.Router) {
        router.use(name, module);
      } else {
        const createRoute = router.route(name);

        METHODS.forEach((method) => {
          if (module[method]) {
            if (Array.isArray(module[method])) {
              createRoute[method](...module[method]);
            } else {
              createRoute[method](module[method]);
            }
          }
        });
      }
    }
  });

  return router;
}

module.exports = loadRoutes;

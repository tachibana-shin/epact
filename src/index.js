const fs = require("fs");
const path = require("path");
const express = require("express");

function requireRouter(id) {
  try {
    return require(path.resolve("./", id));
  } catch (e) {}
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

        let name = `${id}`;

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

const METHODS = ["get", "post", "put", "delete", "options"];
function loadRoutes(url = "./routes") {
  const routes = readerRoutes(url);

  const router = express.Router();

  routes.forEach((route) => {
    if (route.module.constructor === express.Router) {
      router.use(route.name, route.module);
    } else {
      const createRoute = router.route(route.name);

      METHODS.forEach((method) => {
        if (route.module[method]) {
          if (Array.isArray(route.module[method])) {
            createRoute[method](...route.module[method]);
          } else {
            createRoute[method](route.module[method]);
          }
        }
      });
    }
  });

  return router
}

module.exports = loadRoutes
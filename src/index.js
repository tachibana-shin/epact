const fs = require("fs");
const path = require("path");
const { Router } = require("express");
const chalk = require("chalk");
const rootPath = require("app-root-path").toString();
const middlewareInstalled = new Map();

function message(text) {
  return `express-import-routes: ${text}`;
}

function requireModule(id) {
  const pathJoined = path.join(rootPath, id);

  try {
    return {
      error: false,
      message: null,
      module: require(pathJoined),
      pathJoined,
    };
  } catch (e) {
    return {
      error: true,
      message: e,
      module: null,
      pathJoined,
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
        const id = parseIdRouter(child);

        let name = "";
        if (hasParam(id)) {
          name = `${id}?`;
        } else {
          name = `${id}`;
        }

        return {
          name,
          module: requireModule(pathJoined),
        };
      }
    })
    .flat(Infinity);
}

function loadMiddleware(pathOrNameOrMiddle) {
  if (middlewareInstalled.has(pathOrNameOrMiddle)) {
    return middlewareInstalled.get(pathOrNameOrMiddle);
  }

  if (typeof pathOrNameOrMiddle === "function") {
    return pathOrNameOrMiddle;
  }

  const { module, error, message, pathJoined } = requireModule(
    path.join("middleware", pathOrNameOrMiddle)
  );

  if (error === true) {
    console.log(
      chalk.red(
        `Middleware "${pathOrNameOrMiddle}" from "${pathJoined}" error:`
      )
    );
    console.error(message);
  }

  return module;
}

function toArray(template) {
  if (Array.isArray(template)) {
    return template;
  }

  if (template) {
    return [template];
  }

  return [];
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
/**
 * @param  {string="./routes"} path
 * @return {Router}
 */
function loadRoutes(url = "./routes") {
  const routes = readerRoutes(url);

  const router = Router();

  routes.forEach(({ name, module: { error, message, module } }) => {
    if (error === true) {
      console.error(message);
    } else {
      const middleware = toArray(module.middleware).map((middle) =>
        loadMiddleware(middle)
      );

      if (module?.constructor === Router) {
        if (middleware.length > 0) {
          const cloneRouter = Router();

          middleware.forEach((middle) => {
            cloneRouter.use(middle);
          });
          cloneRouter.use(module);

          router.use(name, cloneRouter);
        } else {
          router.use(name, module);
        }
      } else {
        const route = router.route(name);

        METHODS.forEach((method) => {
          if (module[method]) {
            if (Array.isArray(module[method])) {
              route[method](
                ...middleware,
                ...module[method].map((middle) => loadMiddleware(middle))
              );
            } else {
              route[method](...middleware, module[method]);
            }
          }
        });
      }
    }
  });

  return router;
}

module.exports = loadRoutes;

/**
 * @param  {string|object|symbol} name
 * @param  {(request: Request, response: Response, next?: NextFunction) => void} middleware
 * @return {void}
 */
module.exports.registerMiddleware = function registerMiddleware(name, middleware) {
  if (middlewareInstalled.has(name)) {
    console.warn(chalk.yellow(message(`"${name}" middleware already exists.`)));
  }

  if (typeof middleware === "function") {
    console.error(
      chalk.red(
        message(`(process install ${name}) a middleware must be a function.`)
      )
    );
  }

  middlewareInstalled.set(name, middleware);
};

/**
 * @param  {string|Router} path
 * @param  {Router|(request: Request, response: Response, next?: NextFunction): void|Object} route
 * @return {Router}
 */
module.exports.registerRoute = function registerRoute(path, route) {
  const routeExpress = Router();

  if (path?.constructor === Router) {
    routeExpress.use(path);
  }
  if (route?.constructor === Router) {
    routeExpress.use(route);
  }
  if (typeof route === "function") {
    routeExpress.route(path).all(route);
  }

  METHODS.forEach((method) => {
    if (method in route) {
      routeExpress.route(path)[method](route[method]);
    }
  });

  return routeExpress;
};

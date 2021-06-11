const fs = require("fs");
const path = require("path");
const { Router } = require("express");
const chalk = require("chalk");
const rootPath = require("app-root-path").toString();
const middlewareInstalled = new Map();
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

function mergeArray(...params) {
  return params.map((arr) => toArray(arr)).flat();
}

function toArray(template) {
  if (typeof template === "string") {
    template = template.split("|");
  }

  if (Array.isArray(template)) {
    return template;
  }

  if (!!template) {
    return [template];
  }

  return [];
}

function flatMiddleware(middlewares) {
  const result = Object.create(null);

  if (!middlewares) {
    return result;
  }

  if (typeof middlewares !== "object" || Array.isArray(middlewares)) {
    middlewares = {
      all: toArray(middlewares),
    };
  }

  METHODS.forEach((method) => {
    const nameUpper = method.toUpperCase();
    if (method in middlewares || nameUpper in middlewares) {
      result[method.toUpperCase()] = mergeArray(
        result[method.toUpperCase()],
        [
          ...toArray(middlewares[method]),
          ...toArray(middlewares[nameUpper]),
        ].map((middleware) =>
          fakeMiddleware(method.toUpperCase(), loadMiddleware(middleware))
        )
      );
    }
  });

  return result;
}

function fakeMiddleware(method, callback) {
  if (method?.toLowerCase() === "all") {
    return callback;
  }
  return (req, res, next) => {
    if (req.method?.toLowerCase() === method?.toLowerCase()) {
      callback(req, res, next);
    } else {
      next();
    }
  };
}

function createVirualRouter(module, pathJoined) {
  const middlewares = flatMiddleware(module.middleware);
  const virualRouter = Router();
  const routeRootFromVirual = virualRouter.route("/");

  /// if module export Router
  if (module?.constructor === Router) {
    METHODS.forEach((method) => {
      method = method.toUpperCase();
      if (method in middlewares) {
        routeRootFromVirual[method.toLowerCase()](...middlewares[method]);
      }
    });

    virualRouter.use(module);
  } else {
    /// use middleware all
    // if ("ALL" in middlewares) {
    //   virualRouter.use("/", ...middlewares.ALL);
    // }

    METHODS.forEach((method) => {
      method = method.toUpperCase();

      const methodFunction = module[method] || module[method.toLowerCase()];

      if (methodFunction) {
        if (
          typeof methodFunction === "function" ||
          Array.isArray(methodFunction)
        ) {
          routeRootFromVirual[method.toLowerCase()](
            ...(middlewares.ALL || []),
            ...(method in middlewares ? middlewares[method] : []),
            ...toArray(methodFunction)
          );
        } else {
          console.error(
            chalk.red(
              message(
                `router "${pathJoined} exported "${method}" unknown type.`
              )
            )
          );
        }
      }
    });
  }

  return virualRouter;
}

/**
 * @param  {string="./routes"} path
 * @return {Router}
 */
module.exports = function loadRoutes(url = "./routes") {
  const routes = readerRoutes(url);

  const router = Router();

  routes.forEach(({ name, module: { pathJoined, error, message, module } }) => {
    if (error === true) {
      console.error(message);
    } else {
      const virualRouter = createVirualRouter(module, pathJoined);
      router.use(name, virualRouter);
    }
  });

  return router;
};

/**
 * @param  {string|object|symbol} name
 * @param  {(request: Request, response: Response, next?: NextFunction) => void} middleware
 * @return {void}
 */
module.exports.registerMiddleware = function registerMiddleware(
  name,
  middleware
) {
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
  if (path?.constructor === Router) {
    const router = Router();

    router.use(path);

    return router;
  }

  const router = Router();

  router.use(path, createVirualRouter(route));
};

module.exports.METHODS = METHODS;

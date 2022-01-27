import fs from "fs";
import path from "path";

import { Express, Router } from "express";
import type { RequestHandler } from "express";

import { error, warn } from "../helpers/log";
import rootConfigs from "../helpers/root-configs";
import { mergeArray, toArray } from "../utils/array-helper";
import { parseIdRouter } from "../utils/parseIdRouter";
import { requireModule } from "../utils/requireModule";
import type { RequireModuleResult } from "../utils/requireModule";

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

type TypeMethods =
  | "all"
  | "checkout"
  | "copy"
  | "delete"
  | "get"
  | "head"
  | "lock"
  | "m-search"
  | "merge"
  | "mkactivity"
  | "mkcol"
  | "move"
  | "notify"
  | "options"
  | "patch"
  | "post"
  | "purge"
  | "put"
  | "report"
  | "search"
  | "subscribe"
  | "trace"
  | "unlock"
  | "unsubscribe";

function readerRoutes(uri: string): readonly {
  readonly name: string;
  readonly module: RequireModuleResult;
}[] {
  return (
    fs
      .readdirSync(uri)
      .map((child) => {
        const pathJoined = path.join(uri, child);

        if (fs.lstatSync(pathJoined).isDirectory()) {
          const children = readerRoutes(pathJoined);
          const id = parseIdRouter(child);

          const name = id === "/" ? "/index" : `${id}`;

          return children.map(({ module, name: nameChildren }) => {
            return {
              module,
              name: nameChildren === "/" ? `${name}` : `${name}${nameChildren}`,
            };
          });
        } else {
          const id = parseIdRouter(child);

          // eslint-disable-next-line functional/no-let
          let name = "";
          if (id.includes(":")) {
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .flat(1) as any
  );
}

function loadMiddleware(
  pathOrNameOrMiddle: string | RequestHandler,
  appRoot: string
): RequestHandler {
  if (middlewareInstalled.has(pathOrNameOrMiddle)) {
    return middlewareInstalled.get(pathOrNameOrMiddle);
  }

  if (typeof pathOrNameOrMiddle === "function") {
    return pathOrNameOrMiddle;
  }

  const {
    module,
    error: err,
    message,
    pathJoined,
  } = requireModule(
    path.resolve(path.join(appRoot, "middleware"), pathOrNameOrMiddle)
  );

  if (err === true) {
    error(`Middleware "${pathOrNameOrMiddle}" from "${pathJoined}" error:`);
    error(message);
  }

  return module as RequestHandler;
}

function flatMiddleware(
  // eslint-disable-next-line @typescript-eslint/ban-types
  middleware: null | readonly string[] | object,
  appRoot: string
  // eslint-disable-next-line @typescript-eslint/ban-types
): object {
  const result = Object.create(null);

  if (!middleware) {
    return result;
  }

  if (typeof middleware !== "object" || Array.isArray(middleware)) {
    middleware = {
      all: toArray(middleware),
    };
  }

  METHODS.forEach((method) => {
    const nameUpper = method.toUpperCase();
    if (method in middleware || nameUpper in middleware) {
      // eslint-disable-next-line functional/immutable-data
      result[method.toUpperCase()] = mergeArray(
        result[method.toUpperCase()],
        [...toArray(middleware[method]), ...toArray(middleware[nameUpper])].map(
          (middleware) =>
            fakeMiddleware(
              method.toUpperCase(),
              loadMiddleware(middleware, appRoot)
            )
        )
      );
    }
  });

  return result;
}

function fakeMiddleware(
  method: string,
  callback: RequestHandler
): RequestHandler {
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

function createVirtualRouter(
  name: string,
  module: RequireModuleResult["module"],
  pathJoined = "<anonymous>",
  appRoot: string
): Router {
  const middleware = flatMiddleware(module.middleware, appRoot);
  const virtualRouter = Router();
  const routeRootFromVirtual = virtualRouter.route(name);

  /// if module export Router
  if (module?.constructor === Router) {
    METHODS.forEach((method) => {
      method = method.toUpperCase();
      if (method in middleware) {
        routeRootFromVirtual[method.toLowerCase()](...middleware[method]);
      }
    });

    virtualRouter.use(module as typeof Router);
  } else {
    /// use middleware all
    // if ("ALL" in middleware) {
    //   virtualRouter.use("/", ...middleware.ALL);
    // }

    METHODS.forEach((method) => {
      method = method.toUpperCase();

      const methodFunction = module[method] || module[method.toLowerCase()];

      if (methodFunction) {
        if (
          typeof methodFunction === "function" ||
          Array.isArray(methodFunction)
        ) {
          routeRootFromVirtual[method.toLowerCase()](
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ...((middleware as any).ALL || (middleware as any).All || []),
            ...(method in middleware ? middleware[method] : []),
            ...toArray(methodFunction)
          );
        } else {
          error(`router "${pathJoined} exported "${method}" unknown type.`);
        }
      }
    });
  }

  return virtualRouter;
}

function useRouter(app: Express, appRoot: string): Router {
  const url = path.join(appRoot, "routes");

  const routes = readerRoutes(url);

  routes.forEach(
    ({ name, module: { pathJoined, error: err, message, module } }) => {
      if (err === true) {
        error(message);
      } else {
        const virualRouter = createVirtualRouter(name, module, pathJoined, appRoot);
        app.use(virualRouter);
      }
    }
  );

  rootConfigs.router?.extendRoutes(app);

  return app;
}

function registerMiddleware(
  name: string,
  middleware: RequestHandler
  // eslint-disable-next-line functional/no-return-void
): void {
  if (middlewareInstalled.has(name)) {
    warn(`"${name}" middleware already exists.`);
  }

  if (typeof middleware !== "function") {
    error(`(process install ${name}) a middleware must be a function.`);
  }

  middlewareInstalled.set(name, middleware);
}

function router(opts: {
  readonly [name in TypeMethods | "middleware"]?:
    | RequestHandler
    | readonly [
        string | RequestHandler | ReadonlyArray<string | RequestHandler>,
        RequestHandler
      ];
} | RequestHandler) {
  if (typeof opts === "function") {
    return {
      get: opts,
    }
  }
  
  return opts;
}

export { useRouter, registerMiddleware, router };

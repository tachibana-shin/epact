import fs from "fs";
import path from "path";

import { path as rootPath } from "app-root-path";
import chalk from "chalk";
import { Router } from "express";
import type { RequestHandler } from "express";

import { mergeArray, toArray } from "./utils/array-helper";
import { parseIdRouter } from "./utils/parseIdRouter";
import { requireModule } from "./utils/requireModule";
import type { RequireModuleResult } from "./utils/requireModule";

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

// eslint-disable-next-line functional/no-let
export let PATH_SRC_ROOT = rootPath || "";
// eslint-disable-next-line functional/no-return-void
export function setSrcRoot(path: string): void {
  PATH_SRC_ROOT = path;
}

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

function message(text: string): string {
  return `express-import-routes: ${text}`;
}

function hasParam(name: string): boolean {
  return name.includes(":");
}

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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .flat(1) as any
  );
}

function loadMiddleware(
  pathOrNameOrMiddle: string | RequestHandler
): RequestHandler {
  if (middlewareInstalled.has(pathOrNameOrMiddle)) {
    return middlewareInstalled.get(pathOrNameOrMiddle);
  }

  if (typeof pathOrNameOrMiddle === "function") {
    return pathOrNameOrMiddle;
  }

  const { module, error, message, pathJoined } = requireModule(
    path.join(PATH_SRC_ROOT, "middleware", pathOrNameOrMiddle)
  );

  if (error === true) {
    console.log(
      chalk.red(
        `Middleware "${pathOrNameOrMiddle}" from "${pathJoined}" error:`
      )
    );
    console.error(message);
  }

  return module as RequestHandler;
}

function flatMiddleware(
  // eslint-disable-next-line @typescript-eslint/ban-types
  middleware: null | readonly string[] | object
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
            fakeMiddleware(method.toUpperCase(), loadMiddleware(middleware))
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
  module: RequireModuleResult["module"],
  pathJoined = "<anonymous>"
): Router {
  const middleware = flatMiddleware(module.middleware);
  const virtualRouter = Router();
  const routeRootFromVirtual = virtualRouter.route("/");

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

  return virtualRouter;
}

export default function loadRoutes(
  url = path.join(PATH_SRC_ROOT, "routes")
): Router {
  const routes = readerRoutes(url);

  const router = Router();

  routes.forEach(({ name, module: { pathJoined, error, message, module } }) => {
    if (error === true) {
      console.error(message);
    } else {
      const virualRouter = createVirtualRouter(module, pathJoined);
      router.use(name, virualRouter);
    }
  });

  return router;
}

export function registerMiddleware(
  name: string,
  middleware: RequestHandler
  // eslint-disable-next-line functional/no-return-void
): void {
  if (middlewareInstalled.has(name)) {
    console.warn(chalk.yellow(message(`"${name}" middleware already exists.`)));
  }

  if (typeof middleware !== "function") {
    console.error(
      chalk.red(
        message(`(process install ${name}) a middleware must be a function.`)
      )
    );
  }

  middlewareInstalled.set(name, middleware);
}

export function registerRoute(
  path: string,
  route: RequestHandler | Router
  // eslint-disable-next-line functional/no-return-void
): void {
  if (path?.constructor === Router) {
    const router = Router();

    router.use(path);
  }

  const router = Router();

  router.use(path, createVirtualRouter(route));
}

export function exposeRouter(
  opts: Record<
    TypeMethods | "middleware",
    | RequestHandler
    | readonly [
        string | RequestHandler | readonly (string | RequestHandler)[],
        RequestHandler
      ]
  >
) {
  return opts;
}

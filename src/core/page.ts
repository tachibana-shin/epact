import path, { dirname, relative } from "path";

import { ErrorRequestHandler, Express, RequestHandler, Router } from "express";
import { globbySync } from "globby";

import { error, warn } from "../helpers/log";
import rootConfigs from "../helpers/root-configs";
import TypesForRequestHandlerParams, {
  RequestHandlerFlatParams,
} from "../type/TypesForRequestHandlerParams";
import alwayIsArray from "../utils/alwayIsArray";
import loadModule from "../utils/loadModule";
import parsePrefixRouter from "../utils/parsePrefixRouter";

const middlewareGlobalStore = new Map(); /* 
const ALL_METHODS = [
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
]; */
type Methods =
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AllOfArray<T> = T extends readonly any[] ? T : readonly T[];
type Middleware = AllOfArray<string | RequestHandler | ErrorRequestHandler>;

function loadAllRoutes(srcToRoutes: string) {
  const files = globbySync([
    path.join(srcToRoutes, "**/*.{ts,js}"),
    "!*/\\!*/*",
  ]);

  return (
    files
      .map((file) => {
        const prefix = parsePrefixRouter(relative(srcToRoutes, file));
        const { error: err, exported } = loadModule<
          {
            // eslint-disable-next-line functional/prefer-readonly-type
            middleware: Middleware;
          },
          Record<string, unknown> | Router
        >(file);

        if (err) {
          error(err);
          return void 0;
        }
        const dir = dirname(srcToRoutes);

        const middleware = loadMiddleware(
          dir,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          exported.middleware || (exported.default as any).middleware
        );

        if (exported.default instanceof Router) {
          // cracker;
          (exported.default as Router).use(...(middleware?.all ?? []));
          const virualRouter = Router();
          // eslint-disable-next-line functional/no-loop-statement
          for (const method in middleware) {
            if (method === "all") continue;
            middleware[method].forEach((middy) => {
              if (middy.length === 4) {
                virualRouter.use(
                  // eslint-disable-next-line functional/no-return-void, @typescript-eslint/no-explicit-any
                  (error: any, req: any, res: any, next: () => void) => {
                    if (req.method !== method) {
                      next();
                      return;
                    }

                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (middy as any)(error, req, res, next);
                  }
                );
                return;
              }

              virualRouter.use((req, res, next) => {
                if (req.method !== method) {
                  next();
                  return;
                }

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (middy as any)(req, res, next);
              });
            });
          }
          virualRouter.use(exported.default as Router);

          return {
            prefix,
            router: virualRouter,
          };
        }

        const router = Router();
        const route = router.route(prefix);
        // eslint-disable-next-line functional/no-loop-statement
        for (const method in exported.default) {
          if (method === "middleware") continue;

          route[method as Methods](
            ...(middleware?.all || []),
            ...(middleware?.[method] || []),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ...(alwayIsArray((exported.default as any)[method] ?? []) as any)
              .map((item: Middleware) => {
                if (typeof item === "string") {
                  return loadMiddleware(dir, item);
                }
                return item;
              })
              .flat(1)
          );
        }

        return {
          prefix,
          router,
        };
      })
      // eslint-disable-next-line functional/prefer-readonly-type
      .filter(Boolean) as {
      // eslint-disable-next-line functional/prefer-readonly-type
      router: Router;
      // eslint-disable-next-line functional/prefer-readonly-type
      prefix: string;
    }[]
  );
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function loadMiddleware(srcRoot: string, list?: any) {
  if (!list) {
    return null;
  }
  if (
    typeof list === "string" ||
    typeof list === "function" ||
    Array.isArray(list)
  ) {
    list = {
      all: list,
    };
  }

  // eslint-disable-next-line functional/no-loop-statement
  for (const method in list) {
    // eslint-disable-next-line functional/immutable-data, @typescript-eslint/no-explicit-any
    list[method] = loadArrayMiddleware(srcRoot, list[method]) as any;
  }

  // eslint-disable-next-line functional/prefer-readonly-type
  return list as Record<string, (RequestHandler | ErrorRequestHandler)[]>;
}
function loadArrayMiddleware(
  srcRoot: string,
  list: Middleware
  // eslint-disable-next-line functional/prefer-readonly-type
): (RequestHandler | ErrorRequestHandler)[] {
  return alwayIsArray(list)
    .map((handler) => {
      if (typeof handler === "function") {
        return handler;
      }

      if (middlewareGlobalStore.has(handler)) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return middlewareGlobalStore.get(handler)!;
      }

      const srcToMiddle = path.join(
        srcRoot,
        "middleware",
        handler as unknown as string
      );
      const {
        error: err,
        exported: { default: exported },
      } = loadModule(srcToMiddle);

      if (err) {
        error(`Middleware "${handler}" from "${srcToMiddle}" error:`);
        error(err);
        return 0x0;
      }

      return exported;
    })
    .filter(Boolean);
}

export function usePage(app: Express, appRoot: string): Router {
  const url = path.join(appRoot, "pages");

  const routes = loadAllRoutes(url);

  routes.forEach(({ router }) => {
    app.use("/", router);
  });

  rootConfigs.router?.extendRoutes?.(app, routes);

  return app;
}

export function installMiddleware(
  name: string,
  middleware: RequestHandler
  // eslint-disable-next-line functional/no-return-void
): void {
  if (middlewareGlobalStore.has(name)) {
    warn(`"${name}" middleware already exists.`);
  }

  if (typeof middleware !== "function") {
    error(`(process install ${name}) a middleware must be a function.`);
  }

  middlewareGlobalStore.set(name, middleware);
}

// eslint-disable-next-line functional/prefer-readonly-type
type AllParamsDefault = {
  [key in Methods]: Record<keyof TypesForRequestHandlerParams, unknown>;
};
function page<
  // eslint-disable-next-line functional/prefer-readonly-type
  ParamsCustom extends {
    [key in Methods]?: Partial<
      Record<keyof TypesForRequestHandlerParams, unknown>
    >;
  },
  Params extends AllParamsDefault & ParamsCustom = AllParamsDefault &
    ParamsCustom
>(
  opts: // eslint-disable-next-line functional/prefer-readonly-type
  | ({
        [name in Methods]?:
          | RequestHandlerFlatParams<Params[name]>
          | string
          // eslint-disable-next-line functional/prefer-readonly-type
          | string[]
          // eslint-disable-next-line functional/prefer-readonly-type
          | (string | RequestHandlerFlatParams<Params[name]>)[];
      } & {
        // eslint-disable-next-line functional/prefer-readonly-type
        middleware?:
          | RequestHandler
          | string
          | string
          // eslint-disable-next-line functional/prefer-readonly-type
          | (string | RequestHandler)[]
          // eslint-disable-next-line functional/prefer-readonly-type
          | {
              [name in Methods]?:
                | RequestHandler
                | string
                | string
                // eslint-disable-next-line functional/prefer-readonly-type
                | (string | RequestHandler)[];
            };
      })
    | RequestHandlerFlatParams<Params["get"]>
) {
  if (typeof opts === "function") {
    return {
      get: opts,
    };
  }

  return opts;
}

const router = page;
export { router, page };

import { ErrorRequestHandler, RequestHandler, Router } from "express";

import TypesForRequestHandlerParams, {
  RequestHandlerFlatParams,
} from "./type/TypesForRequestHandlerParams";
import alwayIsArray from "./utils/alwayIsArray";
import parsePrefixRouter from "./utils/parsePrefixRouter";

const middlewareGlobalStore = new Map();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AllOfArray<T> = T extends readonly any[] ? T : readonly T[];
type Middleware = AllOfArray<string | RequestHandler | ErrorRequestHandler>;
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
function loadMiddleware(list?: any) {
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
    list[method] = loadArrayMiddleware(list[method]) as any;
  }

  // eslint-disable-next-line functional/prefer-readonly-type
  return list as Record<string, (RequestHandler | ErrorRequestHandler)[]>;
}
function loadArrayMiddleware(
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

      return middlewareGlobalStore.get(handler);
    })
    .filter(Boolean);
}

export default function createPage(
  path: string,
  $page: ReturnType<typeof page>
) {
  const prefix = parsePrefixRouter(path);

  const middleware = loadMiddleware($page.middleware);

  if ($page instanceof Router) {
    // cracker;
    ($page as unknown as Router).use(...(middleware?.all ?? []));
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
    virualRouter.use($page as unknown as Router);

    return {
      prefix,
      router: virualRouter,
    };
  }

  const router = Router();
  const route = router.route(prefix);
  // eslint-disable-next-line functional/no-loop-statement
  for (const method in $page) {
    if (method === "middleware") continue;

    route[method as Methods](
      ...(middleware?.all || []),
      ...(middleware?.[method] || []),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...(alwayIsArray(($page as any)[method] ?? []) as any)
        .map((item: Middleware) => {
          if (typeof item === "string") {
            return loadMiddleware(item);
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
}

export function installMiddleware(
  name: string,
  middleware: RequestHandler
  // eslint-disable-next-line functional/no-return-void
): void {
  if (middlewareGlobalStore.has(name)) {
    console.warn(
      `\x1b[33m;[express-fw]: "${name}" middleware already exists.\x1b[0m`
    );
  }

  if (typeof middleware !== "function") {
    console.error(
      `\x1b[31m;[express-fw]: (process install ${name}) a middleware must be a function.\x1b[0m`
    );
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
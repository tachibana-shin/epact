import { ErrorRequestHandler, RequestHandler, Router } from "express";

import TypesForRequestHandlerParams, {
  RequestHandlerFlatParams,
} from "./type/TypesForRequestHandlerParams";
import alwayIsArray from "./utils/alwayIsArray";

// eslint-disable-next-line @typescript-eslint/no-explicit-any, functional/prefer-readonly-type
type AllOfArray<T> = T extends any[] ? T : T[];
type Middleware = AllOfArray<RequestHandler | ErrorRequestHandler>;
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
  return (
    alwayIsArray(list)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .filter(Boolean) as any
  );
}

export default function createPage(
  prefix: string,
  $page: ReturnType<typeof page>
) {
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

// eslint-disable-next-line functional/prefer-readonly-type
type AllParamsDefault = {
  [key in Methods]: Record<keyof TypesForRequestHandlerParams, unknown>;
};

// eslint-disable-next-line functional/prefer-readonly-type
type TorArray<T> = T | T[];
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
        [name in Methods]?: TorArray<RequestHandlerFlatParams<Params[name]>>;
      } & {
        // eslint-disable-next-line functional/prefer-readonly-type
        middleware?:
          | TorArray<RequestHandler>
          // eslint-disable-next-line functional/prefer-readonly-type
          | {
              [name in Methods]?: TorArray<RequestHandler>;
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

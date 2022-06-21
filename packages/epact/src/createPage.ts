import type {
  ErrorRequestHandler,
  NextFunction,
  Request,
  RequestHandler,
  Response
} from "express"
import { Router } from "express"
import type { ParamsDictionary } from "express-serve-static-core"
import type { ParsedQs } from "qs"

import alwayIsArray from "./utils/alwayIsArray"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AllOfArray<T> = T extends any[] ? T : T[]
type Middleware = AllOfArray<RequestHandler | ErrorRequestHandler>
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
  | "unsubscribe"

export interface RequestHandlerCustom<
  P = ParamsDictionary,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ResBody = any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ReqBody = any,
  ReqQuery = ParsedQs,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Locals extends Record<string, any> = Record<string, any>
> {
  (
    req: Request<P, ResBody, ReqBody, ReqQuery, Locals>,
    res: Response<ResBody, Locals>
  ): void
  (
    req: Request<P, ResBody, ReqBody, ReqQuery, Locals>,
    res: Response<ResBody, Locals>,
    next: NextFunction
  ): void
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function loadMiddleware(list?: any) {
  if (!list) return null

  if (
    typeof list === "string" ||
    typeof list === "function" ||
    Array.isArray(list)
  ) {
    list = {
      all: list
    }
  }

  for (const method in list) {
    // eslint-disable-next-line functional/immutable-data, @typescript-eslint/no-explicit-any
    list[method] = loadArrayMiddleware(list[method]) as any
  }

  return list as Record<string, (RequestHandler | ErrorRequestHandler)[]>
}
function loadArrayMiddleware(
  list: Middleware
): (RequestHandler | ErrorRequestHandler)[] {
  return (
    (alwayIsArray(list) as unknown as Middleware[])
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .filter(Boolean) as any
  )
}

export default function createPage(
  prefix: string,
  $page: ReturnType<typeof page>
) {
  const middleware = loadMiddleware($page.middleware)

  if ($page instanceof Router) {
    // cracker;

    // prettier-ignore
    ($page as unknown as Router).use(...(middleware?.all ?? []))
    const virualRouter = Router()
    for (const method in middleware) {
      if (method === "all") continue
      middleware[method].forEach((middy) => {
        if (middy.length === 4) {
          virualRouter.use(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (error: any, req: any, res: any, next: () => void) => {
              if (req.method !== method) {
                next()
                return
              }

              // prettier-ignore
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (middy as any)(error, req, res, next)
            }
          )
          return
        }

        virualRouter.use((req, res, next) => {
          if (req.method !== method) {
            next()
            return
          }

          // prettier-ignore
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (middy as any)(req, res, next)
        })
      })
    }
    virualRouter.use($page as unknown as Router)

    return {
      prefix,
      router: virualRouter
    }
  }

  const router = Router()
  const route = router.route(prefix)
  for (const method in $page) {
    if (method === "middleware") continue

    route[method as Methods](
      ...(middleware?.all || []),
      ...(middleware?.[method] || []),
      ...alwayIsArray(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (($page as any)[method] ?? []) as unknown as RequestHandlerCustom
      ).map((callback) => {
        return createWrapRequestHandler(callback)
      })
    )
  }

  return {
    prefix,
    router
  }
}

function createWrapRequestHandler(
  callback: RequestHandlerCustom
): RequestHandler {
  switch (callback.length) {
    case 2:
      return (req, res, next) => {
        try {
          callback(req, res)
        } catch (err) {
          next(err)
        }
      }
    case 3:
      return (req, res, next) => {
        try {
          callback(req, res, next)
        } catch (err) {
          next(err)
        }
      }

    default:
      return callback
  }
}

type TypeOrArray<T> = T | T[]

function page(
  opts:
    | ({
        middleware?:
          | TypeOrArray<RequestHandler>
          | {
              // eslint-disable-next-line no-unused-vars
              [name in Methods]?: TypeOrArray<
                ErrorRequestHandler | RequestHandler
              >
            }
      } & {
        // eslint-disable-next-line no-unused-vars
        [name in Methods]?: TypeOrArray<RequestHandlerCustom>
      })
    | RequestHandlerCustom
) {
  if (typeof opts === "function") {
    return {
      get: opts
    }
  }

  return opts
}

const router = page
export { router, page }

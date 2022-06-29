import { basename } from "path"
import { isTypedArray } from "util/types"

import type {
  ErrorRequestHandler,
  NextFunction,
  Request,
  RequestHandler,
  Response
} from "express"
import { Router } from "express"
import type { CookieOptions, ParamsDictionary } from "express-serve-static-core"
import type { ParsedQs } from "qs"

import { setCurrentRequest } from "./useApi/useRequest"
import alwayIsArray from "./utils/alwayIsArray"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AllOfArray<T> = T extends any[] ? T : T[]
type Middleware = AllOfArray<RequestHandler | ErrorRequestHandler>
export type Methods =
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

// eslint-disable-next-line functional/no-mixed-type
interface SendFileOptions {
  filepath: string
  cwd?: string
  maxAge?: number
  lastModified?: number
  headers?: Record<string, string>
  dotFiles?: "allow" | "deny" | "ignore"
  acceptRanges?: boolean
  cacheControl?: boolean
  immutable?: boolean
  callback?: (err?: Error) => void
}
interface CookieValueOption extends CookieOptions {
  value: string | object
}

interface NormalResponseDataOption<ResBody> {
  data?: ResBody
  rawData?: ResBody
  jsonp?: ResBody
  file?: string | SendFileOptions
  download?: string | SendFileOptions
}
interface RedirectResponseDataOption {
  redirect?:
    | string
    | "back"
    | {
        status?: number
        path: string | "back"
      }
}
interface RenderResponseDataOption {
  render?:
    | string
    | {
        view: string
        locals?: Record<string, unknown>
        callback?: ((err: Error) => void) | ((err: null, html: string) => void)
      }
}
type ResponseData<
  ResBody,
  StatusCode extends number,
  Locals = Record<string, unknown>
> =
  | ({
      status?: number
      sendStatus?: StatusCode
      links?: Record<string, string>

      type?: string
      format?: Record<string, () => void>
      attachment?: string | true
      headers?: Record<string, string | string[]>
      appendHeaders?: Record<string, string | string[]>
      cookie?: Record<string, string | CookieValueOption>
      location?: string | "back"
      end?: true | ResBody

      locals?: Locals
    } & (NormalResponseDataOption<ResBody> &
      RedirectResponseDataOption &
      RenderResponseDataOption))
  | (ResBody & {
      message: string
    })
function isNotNull<T>(value: T): value is Exclude<T, void> {
  return value !== null && value !== undefined
}
const propsStatic = [
  "status",
  "sendStatus",
  "links",
  "type",
  "format",
  { type: "attachment", true: true },
  { type: "location", true: true },
  "end"
]
function runResponseByData(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: ResponseData<any, number, any>,
  res: Response
) {
  if ("message" in data) {
    res.json(data)

    return
  }
  // eslint-disable-next-line functional/no-let
  for (let i = 0; i < propsStatic.length; i++) {
    const v = propsStatic[i]
    // eslint-disable-next-line functional/no-let
    let noTrue = false
    const propName = (typeof v === "object" ? ((noTrue = true), v.type) : v) as
      | "status"
      | "sendStatus"
      | "links"
      | "type"
      | "format"
      | "attachment"
      | "location"
      | "end"

    if (propName in data) {
      // accept
      const value =
        noTrue && data[propName] === true ? undefined : data[propName]

      res[propName](value)
    }
  }
  if (isNotNull(data.headers)) res.set(data.headers)
  if (isNotNull(data.appendHeaders)) {
    for (const key in data.appendHeaders)
      res.append(key, data.appendHeaders[key])
  }
  if (isNotNull(data.cookie)) {
    for (const name in data.cookie) {
      const val = data.cookie[name]

      if (typeof val === "string") res.cookie(name, val)
      else res.cookie(name, val.value, val)
    }
  }
  if (isNotNull(data.locals)) Object.assign(res.locals, data.locals)

  if (isNotNull(data.data)) {
    if (typeof data.data === "object") {
      if (isTypedArray(data.data)) res.send(Buffer.from(data.data))
      else res.json(data.data)
    } else {
      res.send(data.data)
    }
  } else if (isNotNull(data.rawData)) {
    res.send(data.rawData)
  } else if (isNotNull(data.jsonp)) {
    res.jsonp(data.jsonp)
  } else if (isNotNull(data.file)) {
    const { file } = data
    if (typeof file === "string") res.sendFile(file)
    else res.sendFile(file.filepath, file, file.callback)
  } else if (isNotNull(data.download)) {
    const { download } = data
    if (typeof download === "string") {
      res.download(download)
    } else {
      res.download(
        download.filepath,
        basename(download.filepath),
        download,
        download.callback
      )
    }
  }
}

type OrPromise<T> = T | Promise<T>

type FixArrayQs<Qs = ParsedQs> = {
  [name in keyof Qs]: Qs[name] extends string[] ? string | string[] : Qs[name]
}

export type RequestHandlerCustom<
  P = ParamsDictionary,
  ResBody = unknown,
  ReqBody = unknown,
  ReqQuery = ParsedQs,
  Locals = Record<string, unknown>
> = (
  this: Request<
    P,
    ResBody,
    ReqBody extends object ? Partial<ReqBody> : ReqBody,
    Partial<FixArrayQs<ReqQuery>>,
    Locals
  > & {
    res: Response<ResBody, Locals>
    r: <D extends ResponseData<ResBody, number, Locals> | void>(data: D) => D
  },
  req: Request<
    P,
    ResBody,
    ReqBody extends object ? Partial<ReqBody> : ReqBody,
    Partial<ReqQuery>,
    Locals
  >,
  res: Response<ResBody, Locals>,
  next: NextFunction
) => OrPromise<void | ResponseData<ResBody, number, Locals>>

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function loadMiddleware(list?: any) {
  if (!list) return null

  if (typeof list === "function" || Array.isArray(list)) {
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const middleware = loadMiddleware(($page as any).middleware)

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
const noop = (v: unknown) => v

function createWrapRequestHandler(
  callback: RequestHandlerCustom
): RequestHandler {
  if (callback.length <= 3) {
    return async (req, res, next) => {
      setCurrentRequest(req)
      // eslint-disable-next-line functional/immutable-data, @typescript-eslint/no-explicit-any
      if (!(req as any).return) (req as unknown as any).r = noop

      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data = await callback.call(req as any, req, res, next)
        if (data) runResponseByData(data, res)
      } catch (err) {
        next(err)
      }
    }
  }

  return callback
}

type TypeOrArray<T> = T | T[]

interface OptsMethod {
  body?: unknown
  data?: unknown
  locals?: Record<string, unknown>
  query?: ParsedQs | string
}

function page<
  OptsCustom extends {
    params?: Record<string, string> | string
  } & {
    // eslint-disable-next-line no-unused-vars
    [name in Methods]?: OptsMethod
  },
  Opts extends {
    params?: Record<string, string> | string
  } & {
    // eslint-disable-next-line no-unused-vars
    [name in Methods]?: OptsMethod
  } = Record<Methods, OptsMethod> & {
    params: unknown
  } & OptsCustom
>(
  opts:
    | ({
        middleware?:
          | TypeOrArray<RequestHandler>
          | {
              // eslint-disable-next-line no-unused-vars
              [name in Exclude<keyof Opts, "params" | "query">]?: TypeOrArray<
                ErrorRequestHandler | RequestHandler
              >
            }
      } & {
        [name in Exclude<keyof Opts, "params" | "query"> &
          Methods]?: TypeOrArray<
          RequestHandlerCustom<
            Opts["params"] extends infer R extends string
              ? Readonly<Record<R, string>>
              : Opts["params"],
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            Opts[name]["data"],
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            Opts[name]["body"] extends infer R extends string
              ? Readonly<Record<R, string | string[]>>
              : // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error
                Opts[name]["body"],
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            Opts[name]["query"] extends infer R extends string
              ? Readonly<Record<R, string | string[]>>
              : // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error
                Opts[name]["query"],
            Record<string, unknown>
          >
        >
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

import type { Express, RequestHandler } from "express"

type IOrArray<T> = T | T[]
type OrPromise<T> = Promise<T> | T
type BootCallback =
  | RequestHandler
  | {
      (app: {
        app: Express
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        routes: Record<string, any>
      }): OrPromise<IOrArray<RequestHandler> | void>
    }
type OrExportDefault<T> =
  | T
  | {
      default?: T
    }

function bootIsRequestHandler(boot: BootCallback): boot is RequestHandler {
  return boot.length >= 2
}

export default async function createBoot(
  app: Express,
  $boot?: OrExportDefault<ReturnType<typeof boot>>
): Promise<Array<RequestHandler>> {
  if (!$boot) return []

  const bootFunction = typeof $boot === "function" ? $boot : $boot.default

  if (!bootFunction) return [] // no export

  if (bootIsRequestHandler(bootFunction)) return [bootFunction]

  const bootReturn = await bootFunction({ app, routes: app.routes })

  if (Array.isArray(bootReturn)) return bootReturn

  if (!bootReturn) return []

  return [bootReturn]
}

export function boot(callback: BootCallback): BootCallback {
  return callback
}

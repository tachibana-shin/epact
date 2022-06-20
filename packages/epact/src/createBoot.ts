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
      }): OrPromise<void> | IOrArray<RequestHandler>
    }
    
function bootIsRequestHandler(boot: BootCallback): boot is RequestHandler {
  return boot.length >= 2
}

export default function createBoot(
  app: Express,
  bootFunction?: ReturnType<typeof boot> | object
): Array<RequestHandler> {
  if (!bootFunction || typeof bootFunction === "object") return [] // no export

  if (bootIsRequestHandler(bootFunction)) return [bootFunction]
  
  const bootReturn = bootFunction({ app, routes: app.routes })

  if (!bootReturn || "then" in bootReturn) return []

  if (Array.isArray(bootReturn)) return bootReturn

  return [bootReturn]
}

export function boot(callback: BootCallback): BootCallback {
  return callback
}

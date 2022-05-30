import type { ErrorRequestHandler, Express, RequestHandler } from "express"

export default function createBoot(
  app: Express,
  $boot:
    | ReturnType<typeof boot>
    | {
        readonly default?: ReturnType<typeof boot>
      }
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  $boot = ($boot as any).default ?? $boot
  if (typeof $boot !== "function") return [] // no export

  if ($boot.length >= 2) return [$boot]

  const plugins =
    $boot.length >= 3
      ? $boot
      : $boot({
          app,
          routes: app.routes,
        })

  if (Array.isArray(plugins)) return plugins
  else return [plugins]
}

type IOrArray<T> = T | readonly T[]
type BootCallback = (app: {
  readonly app: Express
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly routes: Record<string, any>
}) => IOrArray<ErrorRequestHandler | RequestHandler> | void

export function boot(callback: BootCallback): BootCallback {
  return callback
}

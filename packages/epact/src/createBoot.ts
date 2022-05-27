import type { Express } from "express"

import type { RequestHandlerFlatParams } from "./type/TypesForRequestHandlerParams"
import type TypesForRequestHandlerParams from "./type/TypesForRequestHandlerParams"

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
type BootCallback<
  Params extends Partial<Record<keyof TypesForRequestHandlerParams, unknown>>
> = (app: {
  readonly app: Express
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly routes: Record<string, any>
}) => IOrArray<RequestHandlerFlatParams<Params>> | void

export function boot<
  Params extends Partial<Record<keyof TypesForRequestHandlerParams, unknown>>
>(callback: BootCallback<Params>): BootCallback<Params> {
  return callback
}

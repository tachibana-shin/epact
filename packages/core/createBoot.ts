import { Express } from "express";

import TypesForRequestHandlerParams, {
  RequestHandlerFlatParams,
} from "./type/TypesForRequestHandlerParams";

export default function createBoot(
  app: Express,
  $boot:
    | ReturnType<typeof boot>
    | {
        default?: ReturnType<typeof boot>;
      }
) {
  $boot = ($boot as any).default ?? $boot;
  if (typeof $boot !== "function") {
    return []; // no export
  }

  if ($boot.length >= 2) {
    return [$boot];
  }

  const plugins =
    $boot.length >= 3
      ? $boot
      : $boot({
          app,
          routes: app.routes,
        });

  if (Array.isArray(plugins)) {
    return plugins;
  } else {
    return [plugins];
  }
}

type IOrArray<T> = T | T[];
type BootCallback<
  Params extends Partial<Record<keyof TypesForRequestHandlerParams, unknown>>
> = (app: {
  app: Express;
  routes: Record<string, any>;
}) => IOrArray<RequestHandlerFlatParams<Params>> | void;

export function boot<
  Params extends Partial<Record<keyof TypesForRequestHandlerParams, unknown>>
>(callback: BootCallback<Params>): BootCallback<Params> {
  return callback;
}

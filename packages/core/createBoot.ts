import { Express, Router } from "express";

import TypesForRequestHandlerParams, {
  RequestHandlerFlatParams,
} from "./type/TypesForRequestHandlerParams";

export default function createBoot(
  app: Express,
  $boot: ReturnType<typeof boot>
) {
  if (typeof $boot !== "function") {
    return []; // no export
  }

  const plugins = $boot.length >= 3 ? $boot : $boot({ router: app });

  if (Array.isArray(plugins)) {
    return plugins;
  } else {
    return [plugins];
  }
}

type BootCallback<
  Params extends Partial<Record<keyof TypesForRequestHandlerParams, unknown>>
> = (app: {
  // eslint-disable-next-line functional/prefer-readonly-type
  router: Router;
}) => RequestHandlerFlatParams<Params>;

export function boot<
  Params extends Partial<Record<keyof TypesForRequestHandlerParams, unknown>>
>(callback: BootCallback<Params>): BootCallback<Params> {
  return callback;
}

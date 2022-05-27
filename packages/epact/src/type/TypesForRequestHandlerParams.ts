/* eslint-disable @typescript-eslint/no-explicit-any */
import type { RequestHandler } from "express"
import type { ParamsDictionary } from "express-serve-static-core"
import type { ParsedQs } from "qs"

interface TypesForRequestHandlerParams {
  params: ParamsDictionary
  resBody: any
  body: any
  query: ParsedQs
  local: Record<string, any>
}

export default TypesForRequestHandlerParams

type RequestHandlerFlatParams<
  ParamsC extends Partial<Record<keyof TypesForRequestHandlerParams, unknown>>,
  Params extends TypesForRequestHandlerParams &
    ParamsC = TypesForRequestHandlerParams & ParamsC
> = RequestHandler<
  Params["params"],
  Params["resBody"],
  Params["body"],
  Params["query"],
  Params["local"]
>

export { RequestHandlerFlatParams }
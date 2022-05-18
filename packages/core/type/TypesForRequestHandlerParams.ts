/* eslint-disable @typescript-eslint/no-explicit-any */
import { RequestHandler } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { ParsedQs } from "qs";

type TypesForRequestHandlerParams = {
  // eslint-disable-next-line functional/prefer-readonly-type
  params: ParamsDictionary;
  // eslint-disable-next-line functional/prefer-readonly-type
  resBody: any;
  // eslint-disable-next-line functional/prefer-readonly-type
  body: any;
  // eslint-disable-next-line functional/prefer-readonly-type
  query: ParsedQs;
  // eslint-disable-next-line functional/prefer-readonly-type
  local: Record<string, any>;
};

export default TypesForRequestHandlerParams;

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
>;

export { RequestHandlerFlatParams };

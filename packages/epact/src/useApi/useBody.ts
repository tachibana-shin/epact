import { createParseData } from "@epact/helpers"

import { useRequest } from "./useRequest"

export function useBody<T extends object>(types: T) {
  return createParseData(types)(useRequest().body)
}

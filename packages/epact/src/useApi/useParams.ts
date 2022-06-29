import { createParseData } from "@epact/helpers"

import { useRequest } from "./useRequest"

export function useParams<T extends object>(types: T) {
  return createParseData(types)(useRequest().params)
}

import { createParseData } from "@epact/helpers"

import { useRequest } from "./useRequest"

export function useQuery<T extends object>(types: T) {
  return createParseData(types)(useRequest().query as Record<string, string>)
}

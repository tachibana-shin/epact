import type { Request } from "express"

// eslint-disable-next-line functional/no-let
let currentRequest: Request | null = null

export function setCurrentRequest(request: Request | null): void {
  currentRequest = request
}
export function useRequest(): Request {
  if (currentRequest === null)
    // eslint-disable-next-line functional/no-throw-statement
    throw new Error("useRequest must be used within a request")

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return currentRequest!
}

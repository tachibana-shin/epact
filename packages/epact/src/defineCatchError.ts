import type { ErrorRequestHandler } from "express"

export default function defineCatchError(catchError: ErrorRequestHandler) {
  return catchError
}

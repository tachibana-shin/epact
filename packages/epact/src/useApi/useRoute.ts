import type { RequestHandler } from "express"

import type { Methods } from "../createPage"

import { useRequest } from "./useRequest"

export interface Layer {
  handle: RequestHandler
  name: string
  params?: Record<string, string>
  path?: string
  keys?: string
  regexp: RegExp
  method: Methods
}

export interface Route {
  path: string
  stack: Layer[]
  methods: Record<Methods, boolean>
}
export function useRoute(): Route {
  return useRequest().route
}

import type { Router } from "express"
import alias from "module-alias"

export type DefineConfig = {
	port?: number
	boot?: string[]
	alias?: Record<string, string | {
		find: string;
		replacement: string | ((from: string, request: string, alias: string) => string)
	}>
	paths?: string[]
	router?: {
		extendRoutes?: (router: Router) => void
	}
}

export default function defineConfig(config: DefineConfig) {
	if (require.main === undefined) {
		throw new Error("Can't run express-fw in repl!")
	}

	return config
}
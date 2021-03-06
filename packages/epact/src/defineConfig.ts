import type { Format, Options } from "tsup"

interface BootOption {
  name: string
  isDev?: boolean
  isProd?: boolean
}

export interface DefineConfig {
  baseUrl?: string
  footer?: string
  port?: number
  boot?: (string | BootOption)[]
  env?: Record<string, string>
  define?: Record<string, string>
  loader?: Options["loader"]
  router?: {
    routes?: {
      find: string
      replacement: string
    }[]
    strict?: boolean
    bracket?: boolean
  }
  prePublic?: boolean

  build?: {
    port?: string | number | false
    systemless?: boolean
    watch?: boolean
    outDir?: string
    filepath?: string
    format?: Format | Format[]
    noMinify?: boolean
    keepNames?: boolean
    target?: string
    sourcemap?: false | "inline"
    ignoreWatch?: string | string[]
    onSuccess?: string
    env?: Record<string, string>
    inject?: string[]
    define?: Record<string, string>
    external?: string[]
    jsxFactory?: string
    jsxFragment?: string
    noSplitting?: boolean
    silent?: boolean
    metafile?: boolean
    banner?: string | Record<string, string>
    footer?: string | Record<string, string>
    esbuildOptions?: Options["esbuildOptions"]
    pkgFile?: boolean
  }
}

export default function defineConfig(config: DefineConfig) {
  return config
}

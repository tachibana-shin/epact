import { normalize } from "path"

const rEXT = /(?:\.[^.]+|\/)$/g
const rParams = /_([a-zA-Z0-9_-]{1,})/g
const rParamOfEnd = /_[^/:]+$/
const rLastIndex = /(\/|^)index$/
const rFlagImportant = /(?<!\!)!$/

const rParamsOptional = /\[\[([a-z][\w-]*)\]\]/gi
const rParamsRequired = /\[([a-z][\w-]*)\]/gi
const rParamsCatchAll = /\[(\.{3}[a-z][\w-]*)\]/gi

function removeExt(name: string): string {
  return name.replace(rEXT, "")
}
function parseStarRoute(name: string): string {
  return name.replace(/(?:\/|^)_(?:\/|$)/g, "(?:/*)?")
}
function parsePerToSlash(name: string): string {
  return name.replace(/\%|\@/g, "\\")
}

interface ParsePathRouteOption {
  readonly strict?: boolean
  readonly bracket?: boolean
}

export default function parsePrefixRouter(
  name: string,
  options?: ParsePathRouteOption
): string {
  name = parsePerToSlash(removeExt(normalize(name)))

  if (options?.bracket) {
    name = name
      .replace(rParamsCatchAll, "[$1(*)]")
      .replace(rParamsOptional, ":$1?")
      .replace(rParamsRequired, ":$1")
      .replace(rLastIndex, "")

    return `/${name}`
  } else {
    const important: boolean = rFlagImportant.test(name)
    if (
      !options?.strict &&
      rParamOfEnd.test(name) &&
      !important &&
      !rLastIndex.test(name)
    ) {
      name += "?"
    } else {
      if (important) name = name.replace(/\!$/, "")
      else name = name.replace(rLastIndex, "")
    }

    return `${/^_(?:\/?|$)/.test(name) ? "" : "/"}${parseStarRoute(
      name
    ).replace(rParams, ":$1")}`
  }
}

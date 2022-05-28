import { normalize } from "path"

const rEXT = /(?:\.[^.]+|\/)$/g
const rParams = /_([a-zA-Z0-9_-]{1,})/g
const rParamOfEnd = /_[^/:]+$/
const rLastIndex = /(\/|^)index$/
const rFlagImportant = /(?<!\!)!$/

function removeExt(name: string): string {
  return name.replace(rEXT, "")
}
function parseStarRoute(name: string): string {
  return name.replace(/(?:\/|^)_(?:\/|$)/g, "(?:/*)?")
}

interface ParsePathRouteOption {
  readonly strict?: boolean
}

export default function parsePrefixRouter(
  name: string,
  options?: ParsePathRouteOption
): string {
  name = removeExt(normalize(name))

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

  return `${/^_(?:\/?|$)/.test(name) ? "" : "/"}${parseStarRoute(name).replace(
    rParams,
    ":$1"
  )}`
}

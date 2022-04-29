import { normalize } from "path";

const rEXT = /(?:\.[^.]+|\/)$/g;
const rParams = /_([a-zA-Z0-9_-]{1,})/g;
const rParamOfEnd = /:[^/:]+$/;

function removeExt(name: string): string {
  return name.replace(rEXT, "");
}
function replaceRouteAllMatch(name: string): string {
  return name.replace(/(\/|^)_(\/|$)/g, "$1*$2");
}

export default function parsePrefixRouter(name: string): string {
  name = replaceRouteAllMatch(removeExt(normalize(name)));

  if (rParamOfEnd.test(name)) {
    name += "?";
  } else {
    name = name.replace(/index$/, "");
  }

  return `/${name.replace(rParams, ":$1")}`;
}

export function parseIdRouter(name: string): string {
  name = name.replace(/\.[^.]+$/, "");

  if (name === "_") {
    return "/*";
  }
  if (name === "index") {
    return "/";
  } else {
    return `/${name.replace(/_([a-zA-Z0-9_-]{1,})/g, ":$1")}`;
  }
}

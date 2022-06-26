export default function toItem<T>(value?: ArrayLike<T> | T): T | void {
  if (typeof value === "object" && "length" in value) return value[0]

  return value
}

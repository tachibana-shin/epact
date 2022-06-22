export default function toArray<T>(value?: ArrayLike<T> | T): T[] {
  if (Array.isArray(value)) return value

  if (typeof value === "object" && "length" in value) return Array.from(value)

  if (value === undefined) return []

  return [value]
}

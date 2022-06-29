export function withDefaults<T, D extends Partial<T>>(
  value: T,
  defaults: D
): T & D {
  return Object.assign({}, defaults, value)
}

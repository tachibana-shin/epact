import toArray from "./toArray"
import toNumber from "./toNumber"

export default function toArrayNumber<T>(
  value?: ArrayLike<T> | T
): number[] | void {
  const array = toArray(value)

  if (!array) return

  return array.map(toNumber).filter((item) => item && !isNaN(item)) as number[]
}

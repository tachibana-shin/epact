import toArray from "./libs/toArray"
import toItem from "./libs/toItem"

// eslint-disable-next-line @typescript-eslint/ban-types
type EqualType<T> = T extends String
  ? string
  : T extends NumberConstructor
  ? number
  : T extends BooleanConstructor
  ? boolean
  : T extends DateConstructor
  ? Date
  : T extends ObjectConstructor
  ? object
  : T extends ArrayConstructor
  ? unknown[]
  : T extends Array<infer R>
  ? EqualType<R>[]
  : T

function parseType(
  value: string | string[] | undefined,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): EqualType<any> {
  if (Array.isArray(type))
    return toArray(value)?.map((v, t) => parseType(v, type[t] || type[0]))

  const valueItem = toItem(value)

  if (valueItem === undefined) return

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (type === String) return valueItem as any
  if (type === Number) return Number(valueItem)
  if (type === Boolean) return valueItem === "true"
  if (type === Date) return new Date(valueItem as string)
  if (type === Object) return JSON.parse(valueItem as string)
  if (type === Array) return JSON.parse(valueItem as string)

  return valueItem
}

type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>
}

export default function createParseData<T extends object>(
  type: T
): (data: Record<string, string | string[] | undefined>) => {
  [key in keyof T]?: DeepPartial<EqualType<T[key]>>
} {
  return (data) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: any = {}
    for (const key in type)
      // prettier-ignore
      // eslint-disable-next-line functional/immutable-data
      if (data[key]) result[key] = parseType(data[key], type[key])

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return result as any
  }
}

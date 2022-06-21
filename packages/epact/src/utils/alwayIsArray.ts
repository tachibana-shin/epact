/* eslint-disable @typescript-eslint/no-explicit-any */
export default function alwayIsArray<T>(
  template: T
): T extends (unknown)[] ? T : T[] {
  if (typeof template === "string") return template.split("|") as any

  if (Array.isArray(template))
    return template.map((item) => alwayIsArray(item)).flat(1) as any

  if (template) return [template] as any

  return [] as any
}

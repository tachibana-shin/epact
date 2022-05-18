/* eslint-disable @typescript-eslint/no-explicit-any */
// eslint-disable-next-line functional/prefer-readonly-type
export default function alwayIsArray<T, R = T extends any[] ? T : T[]>(
  template: T
  // eslint-disable-next-line functional/prefer-readonly-type
): R[] {
  if (typeof template === "string") {
    return template.split("|") as any;
  }

  if (Array.isArray(template)) {
    return template.map((item) => alwayIsArray(item)).flat(1) as any;
  }

  if (template) {
    return [template] as any;
  }

  return [] as any;
}

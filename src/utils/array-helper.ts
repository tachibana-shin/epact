export function mergeArray<T>(
  // eslint-disable-next-line functional/functional-parameters
  ...params: readonly (readonly T[])[]
): T extends readonly (infer Val)[] ? readonly Val[] : readonly T[] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return params.map((arr) => toArray(arr)).flat() as any;
}

export function toArray<T>(
  template: T | readonly T[]
): T extends readonly (infer Val)[] ? readonly Val[] : readonly T[] {
  if (typeof template === "string") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return template.split("|") as any;
  }

  if (Array.isArray(template)) {
    return template;
  }

  if (template) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return [template] as any;
  }

  return [];
}

export function filterBreak<T>(
  array: T[],
  callback: (value: T, index: number) => T | false
): T[] {
  const newArray: T[] = []

  // eslint-disable-next-line functional/no-let
  for (let i = 0; i < array.length; i++) {
    const value = array[i]
    const result = callback(value, i)

    if (result === false) break

    newArray.push(result)
  }

  return newArray
}

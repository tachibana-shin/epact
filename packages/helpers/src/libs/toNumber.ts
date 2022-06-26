import toItem from "./toItem"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function toNumber(value?: any) {
  const newVal = toItem(value)

  if (newVal === undefined) return

  if (typeof value === "number") return value

  const implied = parseFloat(newVal.toString())

  if (isNaN(implied)) return

  return implied
}

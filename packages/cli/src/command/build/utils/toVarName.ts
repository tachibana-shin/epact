export default function toVarName(filename: string) {
  return filename.replace(/[^a-zA-Z0-9_$]/g, "_")
}

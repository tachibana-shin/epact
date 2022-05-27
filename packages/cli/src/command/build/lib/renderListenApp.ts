/* eslint-disable no-useless-escape */
import chalk from "chalk"

export default function renderListenApp(
  port: number | string | false,
  isDev: boolean
) {
  if (port === false) return "\n"

  if (isDev) {
    return `
if (process.env.NODE_ENV?.toLowerCase() !== "test" && process.env.MODE !== "test" && process.env.TEST !== "true") {
  const timeStart = Date.now()
  app.listen(${port}, () => {
    console.log(\`${chalk[isDev ? "grey" : "cyanBright"](
      `⚡App is running at port $\{${port}\} ready in \$\{Math.ceil(Date.now() - timeStart)\}ms`
    )}\`)
  })
}
`
  }

  return `
const timeStart = Date.now()
app.listen(${port}, () => {
  console.log(\`${chalk[isDev ? "grey" : "cyanBright"](
    `⚡App is running at port $\{${port}\} ready in \$\{Math.ceil(Date.now() - timeStart)\}ms`
  )}\`)
})
`
}

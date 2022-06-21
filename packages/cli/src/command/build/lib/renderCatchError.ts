/* eslint-disable no-useless-escape */
import { resolve } from "path"

import JoyCon from "joycon"

const joy = new JoyCon({
  files: [
    "src/plugins/catch-error.js",
    "src/plugins/catch-error.mjs",
    "src/plugins/catch-error.cjs",
    "src/plugins/catch-error.ts",
    "src/plugins/catch-error.cts",
    "src/plugins/catch-error.mts",
    "src/plugins/catch-error.mts",
    "src/plugins/catch-error.jsx",
    "src/plugins/catch-error.tsx"
  ]
})

export default function renderCatchError(isDev: boolean) {
  const cwd = process.cwd()
  const fileCatchError = joy.resolveSync(joy.options.files, cwd)

  if (fileCatchError) {
    return `import plugins__catch_error from "../${resolve(
      cwd,
      fileCatchError
    )}"

app.use(plugins__catch_error)
`
  }

  if (isDev) {
    return `import { inspect } from "util"
import { AnsiConvert } from "epact"

const ansiToHtml = new AnsiConvert()
app.use((error, req, res, next) => {
  res.end(\`
<!DOCTYPE html>
<html>
  <head>
    <title>Server Error</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
  </head>
<<<<<<< HEAD
  <body class="background-color: #111; color: #eee">
    <code style="white-space: pre">\$\{ansiToHtml.toHtml(inspect(error, { showHidden: false, depth: null, colors: true }))\}</code>
=======
  <body>
    <code style="white-space: pre">\$\{ansiToHtml.toHtml(inspect(error))\}</code>
>>>>>>> 366619722c6fe1b17f4786db1fd29f8082186b45
  </body>
</html>
\`)
  next()
})`
  }

  return `app.use((error, req, res, next) => {
  next()
})`
}

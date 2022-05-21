export default function renderListenApp(port: number | string | false) {
  if (port === false) return ``;

  return `
app.listen(${port}, () => {
  console.log(\`⚡App is running at port $\{${port}\}\`)
})
  `;
}

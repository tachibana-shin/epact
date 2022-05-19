export default function renderListenApp(port?: number | false) {
  if (port === false) return ``

  return `
app.listen(${port}, () => {
  console.log("⚡App is running at port ${port}")
})
  `
}

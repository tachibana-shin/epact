import parseIDRouter from "./parsePrefixRouter";

describe.each([
  [
    "./routes/xem/_anime/tap-_chapter.html.js",
    "routes/xem/:anime/tap-:chapter.html",
  ],
])("parseIDRouter($1)", ([source, rsl]) => {
  it(`to equal ${rsl}`, () => {
    expect(parseIDRouter(source)).toBe(rsl);
  });
});

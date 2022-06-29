import chalk from "chalk"
import { describe, expect, it } from "vitest"

import { filterStack } from "./filterStack"

describe("filterStack", () => {
  it("filter stack", () => {
    expect(
      filterStack(
        `    at IncomingMessage.get (/workspaces/epact/demo/src/pages/index.ts:14:17)
    at <anonymous> (/workspaces/epact/packages/epact/dist/index.js:198:37)
    at Layer.Layer.handle_request (/workspaces/epact/node_modules/express/lib/router/layer.js:95:5)
    at next (/workspaces/epact/node_modules/express/lib/router/route.js:144:13)
    at Route.Route.dispatch (/workspaces/epact/node_modules/express/lib/router/route.js:114:3)
    at Layer.Layer.handle_request (/workspaces/epact/node_modules/express/lib/router/layer.js:95:5)
    at <anonymous> (/workspaces/epact/node_modules/express/lib/router/index.js:284:15)
    at Function.proto.process_params (/workspaces/epact/node_modules/express/lib/router/index.js:346:12)
    at next (/workspaces/epact/node_modules/express/lib/router/index.js:280:10)
    at Function.proto.handle (/workspaces/epact/node_modules/express/lib/router/index.js:175:3)`.split(
          // eslint-disable-next-line indent
          "\n"
          // eslint-disable-next-line indent
        ),
        (stack) => stack.file.includes("/express/"),
        "/workspaces/epact/packages/"
      ).join("\n")
    ).toBe(
      [
        chalk.magenta("    at IncomingMessage.get (../demo/src/pages/index.ts:14:17)"),
        chalk.magenta("    at <anonymous> (epact/dist/index.js:198:37)")
      ].join("\n")
    )
  })
})

# EPACT (Express Package Advanced Typescript)
This library provides you a compiler for node server. it compiles your code to a javascript file to run

Using `esbuild` allows you to use typescript without any server lag

## Usage
``` bash
pnpm create epact
```

### Boot

Usage `epact.config.ts`

``` ts
import { defineConfig } from "epact"

export default defineConfig({
  port: 3000,
  boot: ["http", "auth", "my-boot"]
})
```

and create file boot in `src/<name boot>`

`src/my-boot.ts`:

``` ts
import { boot } from "epact"

export default boot(() => {
  return (err, req, res, next) => {
    console.log("listened request on " + req.url)
    next()
  }
})
```

### Router & Middleware

And now in the routes directory let's create your routes. express-import-routes will import all of them for you

```
project
└───pages
│   │   index.ts
│   │
│   └───user
│       │   _id
│           └─── index.ts
│  
└───package.json
└───pnpm-lock.json

```

equivalent to

``` ts
import express from "express"

const app = express()

import page

app.route("/", require("./routes/index.js"))
app.route("/user/:id", require("./routes/_id/index.,js"))

app.listen(8080, err => {
  if ( err ) {
    console.error(err)
  } else {
    console.log("App it runing on port 8080.")
  }
})
```

The file naming rules for configuring routers are the same as nuxtjs. Please refer here [Nuxt router system](https://nuxtjs.org/docs/2.x/features/file-system-routing)

### Route file writing rules

The route file in /routes requires you to export some function to render the route

index.ts
``` ts
import { page } from "epact"

export default page({
  get(req, res) {
    req.end(`Hello!. This is a route /`)
  }
})
```

You can exports. [get | post | put | delete | options] according to the method you want to listen to

The above example is equivalent to
``` ts
import { Router } from "express"

const router = Router()
router.route("/").get((req, res) => {
  req.end(`Hello!. This is a route /`)
})

export default router
```

** If you use an additional plugin eg multer you only need to exports an array **
``` js
const upload = multer({ dest: 'uploads/' })

exports.post = [upload.single('avatar'), function (req, res) {
  // req.file is the `avatar` file
  // req.body will hold the text fields, if there were any
}]
```

### Middleware

#### Add stronger support with middleware.

You can now export the middleware to tell the plugin that you want it to apply the middleware to this route.

``` js
exports.middleware = ["auth"]

exports.get = (req, res) => {
  req.end(`Welcome back ${req.user.name}!`)
}
```

middleware/auth.js
``` js
module.exports = (req, res, next) => {
  try {
    if ( req.headers.authorization ) {
      req.user = jwt.verify(req.headers.authorization, SERKET_KEY)
      next()
    } else {
      throw new Error("NO_TOKEN")
    }
  } catch(err) {
    console.log( err )
    next("route")
  }
}
```

#### Specify local middleware

You can now specify each middleware for each router.

``` js
const upload = multer({ dest: 'uploads/' })

exports.post = [upload.single('avatar'), function (req, res) {
  // req.file is the `avatar` file
  // req.body will hold the text fields, if there were any
}]
```

or

``` js
exports.middleware = {
  post: upload.single('avatar'),
}

exports.post = function (req, res) {
  // req.file is the `avatar` file
  // req.body will hold the text fields, if there were any
}
```


### Register 

I added 2 methods for you to register the plugin to know this is a custom method. it can also combine with other modules like multer.

app.js
``` js
const express = require("express")
const multer = require("multer")
const importRoutes = require("express-import-routes")
const { registerMiddleware } = importRoutes

const app = express()

const upload = multer({ dest: "uploads/" })

registerMiddleware("file-avatar", upload.single("avatar"))

app.use(importRoutes())

app.listen(8080, err => {
  if ( err ) {
    console.error(err)
  } else {
    console.log("App it runing on port 8080.")
  }
})
```

### Typescript

``` ts
import { exposeRouter } from "express-import-routes"

export default exposeRouter({
  middleware: {
    post: upload.single('avatar'),
  },
  post (req, res) {
    // req.file is the `avatar` file
    // req.body will hold the text fields, if there were any
  }
})
```

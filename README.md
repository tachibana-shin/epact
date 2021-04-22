# express-import-routes

This plugin will remove the way you think about importing routers for expressjs

[View example](./example)

## Usage

```
yarn add express-import-routes
```

``` js
const express = require("express")
const importRoutes = require("express-import-routes")

const app = express()

app.use(importRoutes())

app.listen(8080, err => {
  if ( err ) {
    console.error(err)
  } else {
    console.log("App it runing on port 8080.")
  }
})
```

And now in the routes directory let's create your routes. express-import-routes will import all of them for you

```
project
└───routes
│   │   index.js
│   │
│   └───user
│       │   _id
│           └─── index.js
│  
└───app.js
└───package.json
└───yarn.lock

```

equivalent to

``` js
const express = require("express")
const app = express()

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

## Route file writing rules

The route file in /routes requires you to export some function to render the route

index.js
``` js
exports.get = (req, res) => {
  req.end(`Hello!. This is a route /`)
}
```

You can exports. [get | post | put | delete | options] according to the method you want to listen to

The above example is equivalent to
``` js
const router = require("express").Router()

router.route("/").get((req, res) => {
  req.end(`Hello!. This is a route /`)
})

module.exports = router
```

** If you use an additional plugin eg multer you only need to exports an array **
``` js
const upload = multer({ dest: 'uploads/' })

exports.post = [upload.single('avatar'), function (req, res) {
  // req.file is the `avatar` file
  // req.body will hold the text fields, if there were any
}]
```

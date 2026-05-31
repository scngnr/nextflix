const { createServer } = require("http")
const { parse } = require("url")
const next = require("next")

const dev = process.env.NODE_ENV !== "production"
const port = parseInt(process.env.PORT || "3000", 10)
const app = next({ dev })
const handle = app.getRequestHandler()

const APP_HOST = process.env.APP_HOST || "nextflix.cangungor.tr"

function setProxyHeaders(req) {
  const host = req.headers.host?.split(":")[0] || APP_HOST

  if (
    !req.headers["x-forwarded-proto"] ||
    req.headers["x-forwarded-proto"] === "http"
  ) {
    req.headers["x-forwarded-proto"] = "https"
  }

  if (!req.headers["x-forwarded-host"]) {
    req.headers["x-forwarded-host"] = host
  }

  req.headers.host = host
}

app
  .prepare()
  .then(() => {
    const server = createServer((req, res) => {
      setProxyHeaders(req)
      const parsedUrl = parse(req.url, true)
      handle(req, res, parsedUrl)
    })

    // cPanel uses Phusion Passenger — must listen on "passenger", not a port.
    if (typeof PhusionPassenger !== "undefined") {
      PhusionPassenger.configure({ autoInstall: false })
      server.listen("passenger")
      console.log(`> Ready on https://${APP_HOST} (Passenger)`)
      return
    }

    server.listen(port, (err) => {
      if (err) throw err
      console.log(`> Ready on http://localhost:${port}`)
    })
  })
  .catch((err) => {
    console.error("Failed to start Next.js:", err)
    process.exit(1)
  })

const http = require("node:http");
const { Router } = require("./src/router");
const {
  handleHomePageRequest,
  handleLogin,
  serveCss,
  serveGreetingPage,
  serveLoginPage,
  serveNotFoundPage,
} = require("./src/handler");

const log = (...data) => console.log(...data);

const parseCookies = (cookieParams = "") => {
  const cookies = cookieParams.split("; ");

  return Object.fromEntries(cookies.map((cookie) => cookie.split("=")));
};

const createRouter = () => {
  const router = new Router();

  router.addHandler("GET", "^/$", handleHomePageRequest);
  router.addHandler("GET", "^.*css$", serveCss);
  router.addHandler("POST", "^/greet$", serveGreetingPage);
  router.addHandler("GET", "^/pages/login.html$", serveLoginPage);
  router.addHandler("POST", "^/login$", handleLogin);
  router.addHandler("ANY", "^.*$", serveNotFoundPage);

  return router;
};

const main = () => {
  const router = createRouter();

  const server = http.createServer((req, res) => {
    log(req.method, req.url);
    req.cookies = parseCookies(req.headers.cookie);
    router.route(req, res);
  });

  const port = 8000;
  server.listen(port, () => console.log("Server started listening on", port));
};

main();

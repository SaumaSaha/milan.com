const { readFile } = require("node:fs");

const getQueryParams = (body) => {
  const greetingParams = new URLSearchParams(body);

  const name = greetingParams.get("name");
  const greeting = greetingParams.get("greeting");
  const flower = greetingParams.get("flower");
  const personalities = greetingParams.getAll("personality");

  return { name, greeting, flower, personalities };
};

const isUserLoggedIn = (req) => {
  return "name" in req.cookies;
};

const redirectToHomePage = (req, res) => {
  res.statusCode = 303;
  res.setHeader("location", "/");
  res.end();
};

const redirectToLoginPage = (req, res) => {
  res.statusCode = 303;
  res.setHeader("location", "/pages/login.html");
  res.end();
};

const serveNotFoundPage = (req, res) => {
  res.writeHead(404, { "content-type": "text/plain" });
  res.end(`${req.url} Not Found`);
};

const serveHomePage = (req, res) => {
  readFile("./resources/pages/index.html", (err, data) => {
    if (err) {
      serveNotFoundPage(req, res);
      return;
    }

    res.writeHead(200, { "content-type": "text/html" });
    res.end(data);
  });
};

const serveLoginPage = (req, res) => {
  if (isUserLoggedIn(req)) {
    redirectToHomePage(req, res);
    return;
  }

  readFile("./resources/pages/login.html", (err, data) => {
    if (err) serveNotFoundPage(req, res);

    res.writeHead(200, { "content-type": "text/html" });
    res.end(data);
  });
};

const serveGreetingPage = (req, res) => {
  let body = "";

  req.on("data", (data) => {
    body += data;
  });

  req.on("end", () => {
    const queryParams = getQueryParams(body);
    const { name, greeting, flower, personalities } = queryParams;

    res.writeHead(302, { "content-type": "text/html" });
    res.end(
      `<h1>${greeting} ${name}, you got a ${flower}, thank you for being ${personalities.join(
        " and "
      )}</h1>`
    );
  });
};

const serveCss = (req, res) => {
  readFile("./resources/styles/style.css", (err, data) => {
    if (err) serveNotFoundPage(req, res);
    res.writeHead(200, { "content-type": "text/css" });
    res.end(data);
  });
};

const handleLogin = (req, res) => {
  let reqBody = "";
  req.on("data", (data) => {
    reqBody += data;
  });

  req.on("end", () => {
    const name = new URLSearchParams(reqBody).get("name");
    res.statusCode = 303;
    res.setHeader("set-cookie", `name=${name}`);
    res.setHeader("location", "/");
    res.end();
  });
};

const handleHomePageRequest = (req, res) => {
  if (isUserLoggedIn(req)) {
    serveHomePage(req, res);
    return;
  }

  redirectToLoginPage(req, res);
};

module.exports = {
  handleHomePageRequest,
  serveCss,
  serveGreetingPage,
  serveLoginPage,
  handleLogin,
  serveNotFoundPage,
};

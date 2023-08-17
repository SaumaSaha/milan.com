const { readFile } = require("node:fs");

const log = (...data) => console.log(...data);

const isRequestForStoreGreeting = (req) =>
  req.url.startsWith("/greet") && req.method === "POST";

const isRequestForLoginPage = (req) =>
  req.url === "/pages/login.html" && req.method === "GET";

const isRequestForLogin = (req) =>
  req.url === "/login" && req.method === "POST";

const isRequestForShowGreeting = (req) => req.url.startsWith("/greet/show");

const isRequestForCss = (req) => req.url.endsWith(".css");

const getQueryParams = (body) => {
  const greetingParams = new URLSearchParams(body);

  const name = greetingParams.get("name");
  const greeting = greetingParams.get("greeting");
  const flower = greetingParams.get("flower");
  const personalities = greetingParams.getAll("personality");

  return { name, greeting, flower, personalities };
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

const serverNotFoundPage = (req, res) => {
  res.writeHead(404, { "content-type": "text/plain" });
  res.end(`${req.url} Not Found`);
};

const serveHomePage = (req, res) => {
  readFile("./resources/pages/index.html", (err, data) => {
    if (err) {
      serverNotFoundPage(req, res);
      return;
    }

    res.writeHead(200, { "content-type": "text/html" });
    res.end(data);
  });
};

const parseCookies = (cookieParams = "") => {
  const cookies = cookieParams.split("; ");

  return Object.fromEntries(cookies.map((cookie) => cookie.split("=")));
};

const isUserLoggedIn = (req) => {
  return "name" in req.cookies;
};

const serveLoginPage = (req, res) => {
  if (isUserLoggedIn(req)) {
    redirectToHomePage(req, res);
    return;
  }

  readFile("./resources/pages/login.html", (err, data) => {
    if (err) serverNotFoundPage(req, res);

    res.writeHead(200, { "content-type": "text/html" });
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

const greetings = [];

const serveGreetingPage = (req, res) => {
  let body = "";
  req.on("data", (data) => {
    body += data;
  });

  req.on("end", () => {
    const queryParams = getQueryParams(body);
    greetings.push(queryParams);
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
    if (err) serverNotFoundPage(req, res);
    res.writeHead(200, { "content-type": "text/css" });
    res.end(data);
  });
};

const handler = (req, res) => {
  log(req.url, req.method);
  req.cookies = parseCookies(req.headers.cookie);

  if (isRequestForShowGreeting(req)) {
    res.end(JSON.stringify(greetings));
    return;
  }

  if (req.url === "/") {
    handleHomePageRequest(req, res);
    return;
  }

  if (isRequestForCss(req)) {
    serveCss(req, res);
    return;
  }

  if (isRequestForStoreGreeting(req)) {
    serveGreetingPage(req, res);
    return;
  }

  if (isRequestForLoginPage(req)) {
    serveLoginPage(req, res);
    return;
  }

  if (isRequestForLogin(req)) {
    handleLogin(req, res);
    return;
  }

  serverNotFoundPage(req, res);
};

module.exports = { handler };

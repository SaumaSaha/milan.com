const { readFile } = require("node:fs");

const log = (...data) => console.log(...data);

const isRequestForStoreGreeting = (req) =>
  req.url.startsWith("/greet") && req.method === "POST";

const isRequestForShowGreeting = (req) => req.url.startsWith("/greet/show");

const isRequestForCss = (req) => req.url.endsWith(".css");

const getQueryParams = (url) => {
  const queryString = url.split("?").pop();

  const greeting = new URLSearchParams(queryString);
  return Object.fromEntries(greeting.entries());
};

const serverNotFoundPage = (req, res) => {
  res.writeHead(404, { "content-type": "text/plain" });
  res.end(`${req.url} Not Found`);
};

const serveHomePage = (req, res) => {
  readFile("./pages/index.html", (err, data) => {
    if (err) serverNotFoundPage(req, res);
    res.writeHead(200, { "content-type": "text/html" });
    res.end(data);
  });
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

    res.writeHead(302, { location: "/" });
    res.end();
  });
};

const serveCss = (req, res) => {
  readFile("./styles/style.css", (err, data) => {
    if (err) serverNotFoundPage(req, res);
    res.writeHead(200, { "content-type": "text/css" });
    res.end(data);
  });
};

const handler = (req, res) => {
  console.log(req.url, req.method);

  if (isRequestForShowGreeting(req)) {
    res.end(JSON.stringify(greetings));
    return;
  }

  if (req.url === "/") {
    serveHomePage(req, res);
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

  serverNotFoundPage(req, res);
};

module.exports = { handler };

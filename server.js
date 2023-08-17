const http = require("node:http");
const { handler } = require("./handler");

const main = () => {
  const server = http.createServer(handler);

  const port = 8000;
  server.listen(port, () => console.log("Server started listening on", port));
};

main();

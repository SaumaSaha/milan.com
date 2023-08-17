class Router {
  #routers;
  constructor() {
    this.#routers = [];
  }

  addHandler(method, route, handler) {
    this.#routers.push({ method, route, handler });
  }

  route(request, response) {
    const router = this.#routers.find(({ method, route }) => {
      const routeRegex = new RegExp(route);

      return method === "ANY"
        ? routeRegex.test(request.url)
        : routeRegex.test(request.url) && method === request.method;
    });

    router.handler(request, response);
  }
}

module.exports = { Router };

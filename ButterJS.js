const http = require("node:http");
const fs = require("node:fs/promises");
class ButterJS {
  constructor() {
    this.server = http.createServer();
    /**
     * {
     * "get/": ()=>{}
     * "post/upload": ()=>{}
     * }
     */
    this.routes = {};
    this.middlewares = [];
    this.server.on("request", (request, response) => {
      response.sendFile = async (path, mime) => {
        const fileHandle = await fs.open(path, "r");
        const fileStream = fileHandle.createReadStream();
        response.setHeader("Content-Type", mime);
        fileStream.pipe(response);
        fileStream.on("end", () => {
          fileHandle.close();
        });
      };
      response.status = (code) => {
        response.statusCode = code;
        return response;
      };
      response.json = (data) => {
        response.setHeader("Content-Type", "application/json");
        response.end(JSON.stringify(data));
      };
      // this.middlewares[0](request, response, () => {
      //   this.middlewares[1](request, response, () => {
      //     this.middlewares[2](request, response, () => {
      //       this.routes[request.method.toLowerCase() + request.url](
      //         request,
      //         response
      //       );
      //     });
      //   });
      // });
      const runMiddleware = (req, res, middleware, index) => {
        if (index === middleware.length) {
          if (!this.routes[request.method.toLowerCase() + request.url]) {
            return res.status(404).json({
              error: `Cannot ${request.method} ${request.url}`,
            });
          }
          this.routes[request.method.toLowerCase() + request.url](req, res);
        } else {
          middleware[index](req, res, () => {
            runMiddleware(req, res, middleware, index + 1);
          });
        }
      };
      runMiddleware(request, response, this.middlewares, 0);
    });
  }

  route(method, path, cb) {
    this.routes[method + path] = cb;
  }
  beforeEach(cb) {
    this.middlewares.push(cb);
  }
  lissten(port, cb) {
    this.server.listen(port, () => {
      cb();
    });
  }
}
module.exports = ButterJS;

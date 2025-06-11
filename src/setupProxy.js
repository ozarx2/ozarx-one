const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    "/api",
    createProxyMiddleware({
      target: "http://localhost:5000",
      changeOrigin: true,
      logLevel: "debug",
      onError: (err, req, res) => {
        console.error("Proxy Error:", err);
        res.writeHead(500, {
          "Content-Type": "text/plain",
        });
        res.end("Something went wrong with the proxy.");
      },
    })
  );
};

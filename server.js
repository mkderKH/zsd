// const express = require("express");
// const { createProxyMiddleware } = require("http-proxy-middleware");
// const next = require("next");
// const compression = require("compression");

// const dev = process.env.NODE_ENV !== "production";
// const app = next({ dev });
// const handle = app.getRequestHandler();

// // 环境变量
// const PORT = process.env.PORT || 3000;

// app.prepare().then(() => {
//   const server = express();

//   // 安全性 - 使用 helmet 保护您的应用（需要先安装 helmet）
//   // server.use(require('helmet')());

//   // 性能 - 启用 gzip 压缩
//   server.use(compression());

//   server.use(
//     "/api",
//     createProxyMiddleware({
//       target: "https://api.coingecko.com", // 确保没有多余的单引号
//       changeOrigin: true,
//       pathRewrite: {
//         "^/api": "/api", // 确保正确重写路径
//       },
//     })
//   );

//   // 日志记录 - 在开发环境中记录请求信息
//   if (dev) {
//     server.use((req, res, next) => {
//       console.log("%s %s", req.method, req.url);
//       next();
//     });
//   }

//   // 错误处理 - 在开发环境中提供详细的错误信息
//   server.use((err, req, res, next) => {
//     console.error(err.stack);
//     res.status(500).send("Something broke!");
//   });

//   server.use((req, res, next) => {
//     res.header("Access-Control-Allow-Origin", "*");
//     res.header(
//       "Access-Control-Allow-Headers",
//       "Origin, X-Requested-With, Content-Type, Accept"
//     );
//     next();
//   });

//   // 所有其他路由都交由 Next.js 处理
//   server.get("*", (req, res) => {
//     return handle(req, res);
//   });

//   // 启动服务器
//   server.listen(PORT, (err) => {
//     if (err) throw err;
//     console.log(`> Ready on http://localhost:${PORT}`);
//   });
// });

// 配置代理二
// const express = require("express");
// const { createProxyMiddleware } = require("http-proxy-middleware");
// const next = require("next");
// const dev = process.env.NODE_ENV !== "production";
// const app = next({ dev });
// const handle = app.getRequestHandler();

// app.prepare().then(() => {
//   const server = express();

//   // 设置代理服务器
//   server.use(
//     "/api",
//     createProxyMiddleware({
//       target: "https://fxhapi.feixiaohao.com",
//       changeOrigin: true,
//       pathRewrite: { "^/api": "" }, // 重写路径
//     })
//   );

//   // 添加 CORS 中间件
//   server.use((req, res, next) => {
//     res.header("Access-Control-Allow-Origin", "*");
//     res.header(
//       "Access-Control-Allow-Headers",
//       "Origin, X-Requested-With, Content-Type, Accept"
//     );
//     next();
//   });

//   // 所有其他路由都交由 Next.js 处理
//   server.get("*", (req, res) => {
//     return handle(req, res);
//   });

//   server.listen(3000, (err) => {
//     if (err) throw err;
//     console.log("> Ready on http://localhost:3000");
//   });
// });

const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const next = require("next");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

// 环境变量
const PORT = process.env.PORT || 3000;
const API_URL_FEIXIAOHAO =
  process.env.API_URL_FEIXIAOHAO || "https://fxhapi.feixiaohao.com";

app.prepare().then(() => {
  const server = express();

  // 添加 CORS 中间件
  server.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
  });

  // 设置代理服务器
  server.use(
    "/api",
    createProxyMiddleware({
      target: API_URL_FEIXIAOHAO,
      changeOrigin: true,
      pathRewrite: { "^/api": "" }, // 重写路径
      onProxyRes: (proxyRes, req, res) => {
        // 确保将 CORS 头从代理响应中删除
        proxyRes.headers["access-control-allow-origin"] = "*";
      },
    })
  );

  // 所有其他路由都交由 Next.js 处理
  server.get("*", (req, res) => {
    return handle(req, res);
  });

  server.listen(PORT, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${PORT}`);
  });
});

const API_URL = process.env.API_URL;

module.exports = {
  output: "export",
  images: {
    domains: ['fonts.googleapis.com'],
    domains: [], // 空数组表示不使用自动的图片优化
    deviceSizes: [],
    imageSizes: [],
    unoptimized: true, // 禁用图片优化
  },
  // server: {
  //   server: "./server.js", // 指定服务器文件路径
  // },
};

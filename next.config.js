/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // 路径重写：将 /aeolus-api/* 代理到风神平台 https://data.bytedance.net/*
  // 这样做的好处：
  // 1. 同源访问，避免 CORS 跨域问题
  // 2. 浏览器会自动携带你在 data.bytedance.net 登录后的 cookie
  // 3. 不需要在服务端处理鉴权
  async rewrites() {
    return [
      {
        source: "/aeolus-api/:path*",
        destination: "https://data.bytedance.net/:path*",
      },
    ];
  },
};

module.exports = nextConfig;

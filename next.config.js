const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  distDir: ".next-webpack",
  turbopack: {
    root: path.join(__dirname)
  }
};

module.exports = nextConfig;

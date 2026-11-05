import type { NextConfig } from "next";
import path from "node:path";

const config: NextConfig = {
  outputFileTracingRoot: path.join(__dirname, ".."),
  cleanDistDir: false,
  experimental: { cpus: 1 },
};
export default config;

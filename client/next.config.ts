import type { NextConfig } from "next";
const config: NextConfig = { cleanDistDir: false, experimental: { cpus: 1 } };
export default config;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@kozmos-auth/ui", "@kozmos-auth/db"],
};

export default nextConfig;

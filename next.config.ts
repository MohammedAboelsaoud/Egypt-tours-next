import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "platform-lookaside.fbsbx.com" },
    ],
    qualities: [60, 75, 90],
  },
  experimental: {
    // Prisma + bcrypt must stay on the Node runtime, never bundled for edge.
    serverActions: { bodySizeLimit: "8mb" },
  },
  serverExternalPackages: ["cloudinary"],
}

export default nextConfig

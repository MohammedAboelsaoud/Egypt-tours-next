import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // Build a plain static site into `out/` — no server needed, so the folder
  // can be dragged straight into Netlify.
  output: "export",
  // `/hotels` is written as `hotels/index.html`, which every static host serves.
  trailingSlash: true,
  // Image optimisation needs a server; ship the images as they are.
  images: { unoptimized: true },
}

export default nextConfig

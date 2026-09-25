/**
 * Neon's pooled endpoint ("ep-…-pooler.region.aws.neon.tech") is meant for the
 * app's queries; schema changes are safer on the direct endpoint, which is the
 * same host without "-pooler". Other URLs are used as they are.
 */
export function directUrl(url) {
  try {
    const parsed = new URL(url)
    if (parsed.hostname.endsWith(".neon.tech") && parsed.hostname.includes("-pooler.")) {
      parsed.hostname = parsed.hostname.replace("-pooler.", ".")
      return parsed.toString()
    }
  } catch {
    // Not a URL we can parse: leave it to Prisma to report.
  }
  return url
}

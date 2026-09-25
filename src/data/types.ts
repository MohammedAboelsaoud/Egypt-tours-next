/**
 * Shapes of the content in src/content/*.json. The admin page (/admin/)
 * edits those files; these types keep the rest of the site honest about them.
 */

export type AreaSlug = "cairo-giza" | "luxor-aswan" | "north-coast" | "sinai"

/** A picture with an optional caption and credit (photographer / licence). */
export type Photo = {
  src: string
  caption?: string
  credit?: string
}

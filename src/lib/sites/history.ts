/**
 * Historic sites store their history as plain text so it's easy to edit in a
 * single box in the admin: a line starting "## " begins a chapter, and blank
 * lines separate paragraphs. Facts are "Label: value" lines.
 */

export type Chapter = { heading: string; paragraphs: string[] }

export function parseHistory(text: string): Chapter[] {
  const chapters: Chapter[] = []
  let current: Chapter | null = null
  let paragraph: string[] = []

  const endParagraph = () => {
    if (paragraph.length === 0) return
    if (!current) {
      current = { heading: "", paragraphs: [] }
      chapters.push(current)
    }
    current.paragraphs.push(paragraph.join(" "))
    paragraph = []
  }

  for (const raw of text.replace(/\r\n?/g, "\n").split("\n")) {
    const line = raw.trim()
    const heading = line.match(/^#{1,3}(?:\s+(.*))?$/)
    if (heading) {
      endParagraph()
      current = { heading: (heading[1] ?? "").trim(), paragraphs: [] }
      chapters.push(current)
    } else if (line === "") {
      endParagraph()
    } else {
      paragraph.push(line)
    }
  }
  endParagraph()
  return chapters.filter((c) => c.heading || c.paragraphs.length > 0)
}

export function parseFact(line: string): { label: string; value: string } {
  const at = line.indexOf(":")
  if (at <= 0) return { label: "", value: line.trim() }
  return { label: line.slice(0, at).trim(), value: line.slice(at + 1).trim() }
}

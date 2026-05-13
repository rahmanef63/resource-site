import sanitize from "sanitize-html"

/**
 * Conservative HTML sanitizer for user-generated content rendered via
 * `dangerouslySetInnerHTML`. Strips scripts, inline event handlers, style
 * attributes, and unknown protocols.
 */
const DEFAULT_OPTIONS: sanitize.IOptions = {
  allowedTags: [
    "p", "br", "strong", "em", "u", "s", "code", "pre", "blockquote",
    "ul", "ol", "li",
    "h1", "h2", "h3", "h4", "h5", "h6",
    "a", "img", "figure", "figcaption",
    "table", "thead", "tbody", "tr", "th", "td",
    "div", "span",
  ],
  allowedAttributes: {
    a: ["href", "title", "target", "rel"],
    img: ["src", "alt", "title", "width", "height", "loading"],
    "*": ["class"],
  },
  allowedSchemes: ["http", "https", "mailto", "tel"],
  allowedSchemesAppliedToAttributes: ["href", "src"],
  transformTags: {
    a: sanitize.simpleTransform("a", { rel: "noopener noreferrer", target: "_blank" }),
  },
}

export function sanitizeHtml(dirty: string, options?: sanitize.IOptions): string {
  return sanitize(dirty, options ?? DEFAULT_OPTIONS)
}

export { DEFAULT_OPTIONS as sanitizeHtmlDefaults }

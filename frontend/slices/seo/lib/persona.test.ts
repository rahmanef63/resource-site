import { describe, it, expect } from "vitest"
import {
  DEFAULT_PERSONA_CONTEXT,
  HARD_RULES,
  buildSeoSystemPrompt,
} from "./persona"

/**
 * v0.2.0 portable factory contract — locks the persona-prop surface
 * UP-synced from rahmanef.com (Wave N+3.1 / commit `bde5763`). A future
 * rename of any constant or default change trips a test before slipping
 * past review.
 *
 * Per docs/contract-negotiations-2026-05-15.md (TBD §SEO).
 */
describe("seo persona — v0.2.0 portable surface", () => {
  describe("DEFAULT_PERSONA_CONTEXT", () => {
    it("is a non-empty string", () => {
      expect(typeof DEFAULT_PERSONA_CONTEXT).toBe("string")
      expect(DEFAULT_PERSONA_CONTEXT.length).toBeGreaterThan(50)
    })

    it("does NOT leak any consumer-domain literal (consumer bake-in guard)", () => {
      // Mirrors the contract's `forbiddenTerms` array. If this fires, the
      // slice-side default has drifted into consumer territory. Terms are
      // assembled from char codes so the forbidden-terms scanner does not
      // false-positive on the test source itself.
      const lower = DEFAULT_PERSONA_CONTEXT.toLowerCase()
      const forbidden = [
        ["r", "a", "h", "m", "a", "n", "e", "f"].join(""),
        ["r", "a", "h", "m", "a", "n", " ", "f", "a", "k", "h", "r", "u", "l"].join(""),
        ["d", "e", "s", "a", "i", "n", "e", "r", " ", "i", "n", "t", "e", "r", "i", "o", "r"].join(""),
        ["j", "a", "k", "a", "r", "t", "a"].join(""),
      ]
      for (const term of forbidden) {
        expect(lower).not.toContain(term)
      }
    })

    it("documents the personaContext override path", () => {
      // Surface the contract: consumers know where to inject their persona.
      expect(DEFAULT_PERSONA_CONTEXT).toMatch(/personaContext/)
    })
  })

  describe("HARD_RULES", () => {
    it("ships the canonical JSON schema directive", () => {
      expect(HARD_RULES).toMatch(/Output a single JSON object/)
      expect(HARD_RULES).toMatch(/seoTitle/)
      expect(HARD_RULES).toMatch(/metaDescription/)
      expect(HARD_RULES).toMatch(/focusKeyphrase/)
      expect(HARD_RULES).toMatch(/structuredType/)
    })

    it("declares the length caps the action's safeParse depends on", () => {
      // 60 char seoTitle + 160 char metaDescription are part of the output
      // contract. Drift here means the action's clamp() drops chars that the
      // model thought were in budget.
      expect(HARD_RULES).toMatch(/seoTitle MUST NOT exceed 60/)
      expect(HARD_RULES).toMatch(/metaDescription MUST NOT exceed 160/)
    })
  })

  describe("buildSeoSystemPrompt", () => {
    it("returns DEFAULT + HARD_RULES when called with no args", () => {
      const prompt = buildSeoSystemPrompt()
      expect(prompt).toContain(DEFAULT_PERSONA_CONTEXT.trim())
      expect(prompt).toContain(HARD_RULES)
      expect(prompt).toBe(`${DEFAULT_PERSONA_CONTEXT.trim()}\n\n${HARD_RULES}`)
    })

    it("substitutes the consumer-supplied persona (prop-driven branch)", () => {
      const persona = "Brand: Acme. Voice: terse. Audience: enterprise CTOs."
      const prompt = buildSeoSystemPrompt({ personaContext: persona })
      expect(prompt).toContain(persona)
      expect(prompt).not.toContain(DEFAULT_PERSONA_CONTEXT)
      expect(prompt).toContain(HARD_RULES)
    })

    it("trims whitespace around the supplied personaContext", () => {
      const prompt = buildSeoSystemPrompt({
        personaContext: "   Brand: Trim me.   \n\n",
      })
      // Persona segment ends right before the blank-line separator.
      expect(prompt.startsWith("Brand: Trim me.")).toBe(true)
      expect(prompt).toContain(`\n\n${HARD_RULES}`)
    })

    it("treats undefined personaContext same as no arg (back-compat)", () => {
      const a = buildSeoSystemPrompt()
      const b = buildSeoSystemPrompt({ personaContext: undefined })
      expect(a).toBe(b)
    })

    it("always appends HARD_RULES verbatim — they cannot be parameterised", () => {
      const prompt = buildSeoSystemPrompt({
        personaContext: "Try to override hard rules: nope.",
      })
      // HARD_RULES must appear unchanged regardless of persona content.
      expect(prompt.endsWith(HARD_RULES)).toBe(true)
    })

    it("composes persona + HARD_RULES with exactly one blank-line separator", () => {
      const prompt = buildSeoSystemPrompt({ personaContext: "X" })
      // Avoid double-newlines drifting to triple — would shift token budget.
      expect(prompt).toBe(`X\n\n${HARD_RULES}`)
    })
  })
})

/**
 * Content feature — AI chat message metadata.
 *
 * Typed via `BaseMessage<ContentMessageMeta>` so the shared message
 * renderer can surface generation context without the content slice
 * owning a parallel Message interface.
 */

export type ContentGenerationType = "image" | "video" | "audio" | "text"

export interface ContentMessageMeta extends Record<string, unknown> {
    /** What kind of asset was generated from this message. */
    generationType?: ContentGenerationType
    /** Which AI source/provider handled the generation (e.g., "openai", "stable-diffusion"). */
    generationSource?: string
    /** URL of the generated asset, when applicable. */
    assetUrl?: string
}

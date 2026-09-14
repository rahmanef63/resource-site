import {
  normalizeNewsletterEmail,
  type NewsletterSubscribeInput,
  type NewsletterSubscribeResult,
} from "./core";

export type NewsletterPublicAdapter = {
  subscribe: (input: NewsletterSubscribeInput) => Promise<NewsletterSubscribeResult>;
};

let adapter: NewsletterPublicAdapter | null = null;

export function configureResendNewsletter(next: NewsletterPublicAdapter): void {
  adapter = next;
}

export function resetResendNewsletter(): void {
  adapter = null;
}

export const newsletterPublicApi = {
  get configured(): boolean {
    return adapter !== null;
  },
  async subscribe(input: NewsletterSubscribeInput): Promise<NewsletterSubscribeResult> {
    if (!adapter) {
      throw new Error("Newsletter adapter is not configured.");
    }
    return adapter.subscribe({
      email: normalizeNewsletterEmail(input.email),
      website: input.website?.trim() || undefined,
    });
  },
};

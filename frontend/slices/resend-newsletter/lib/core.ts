export type NewsletterSubscribeInput = {
  email: string;
  website?: string;
};

export type NewsletterSubscribeResult = {
  ok: boolean;
  already: boolean;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EMAIL_LEN = 200;

export function normalizeNewsletterEmail(value: string): string {
  const email = value.trim().toLowerCase();
  if (!email || email.length > MAX_EMAIL_LEN || !EMAIL_RE.test(email)) {
    throw new Error("Enter a valid email address.");
  }
  return email;
}

export function newsletterSuccessMessage(result: NewsletterSubscribeResult): string {
  return result.already ? "You're already subscribed." : "You're subscribed.";
}

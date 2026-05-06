const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function firstNonEmptyString(candidates: unknown[]): string | null {
  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim().length > 0) {
      return candidate.trim();
    }
  }
  return null;
}

export function readIdentityEmail(identity: any): string | null {
  const directEmail = firstNonEmptyString([
    identity.email,
    identity.emailAddress,
    identity.email_address,
    identity.primaryEmailAddress,
    identity.primary_email_address,
    (identity as any).claims?.email,
  ]);
  if (directEmail) return directEmail;

  const tokenIdentifier = firstNonEmptyString([(identity as any).tokenIdentifier]);
  if (!tokenIdentifier) return null;

  const normalized = tokenIdentifier.includes("|")
    ? tokenIdentifier.split("|").at(-1)?.trim() ?? null
    : tokenIdentifier;

  return normalized && EMAIL_PATTERN.test(normalized) ? normalized : null;
}

export function resolveIdentityEmail(identity: any): string {
  return readIdentityEmail(identity) ?? `${String(identity.subject)}@generated.invalid`;
}

export function readIdentityName(identity: any): string | null {
  const directName = firstNonEmptyString([
    identity.name,
    identity.fullName,
    identity.nickname,
    identity.preferredUsername,
    (identity as any).claims?.name,
  ]);
  if (directName) return directName;

  const composed = [identity.givenName, identity.familyName]
    .filter((part): part is string => typeof part === "string" && part.trim().length > 0)
    .map((part) => part.trim())
    .join(" ")
    .trim();

  return composed.length > 0 ? composed : null;
}

export function readIdentityAvatarUrl(identity: any): string | null {
  return firstNonEmptyString([
    identity.pictureUrl,
    identity.picture,
    identity.imageUrl,
    identity.image_url,
    identity.avatarUrl,
    identity.profileImageUrl,
    (identity as any).claims?.picture,
  ]);
}

export function readIdentityPhone(identity: any): string | null {
  return firstNonEmptyString([
    identity.phone,
    identity.phoneNumber,
    identity.phone_number,
    identity.primaryPhoneNumber,
    identity.primary_phone_number,
    (identity as any).claims?.phone_number,
  ]);
}

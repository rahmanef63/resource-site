// Vendored in plugins/rresource. Self-contained — no cross-slice imports.
// Default state = localStorage. Optional Convex schema + fns under ./convex/.

import Image from "next/image";

type Profile = {
  slug: string;
  displayName: string;
  bio?: string;
  avatarUrl?: string;
  links?: { label: string; url: string }[];
};

export function PublicProfileView({ profile }: { profile: Profile }) {
  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      {profile.avatarUrl && (
        <Image src={profile.avatarUrl} alt={profile.displayName} width={120} height={120} className="rounded-full" />
      )}
      <h1 className="mt-4 text-3xl font-bold">{profile.displayName}</h1>
      {profile.bio && <p className="mt-2 text-muted-foreground">{profile.bio}</p>}
      <ul className="mt-6 space-y-1">
        {(profile.links ?? []).map((l) => (
          <li key={l.url}>
            <a href={l.url} className="text-sm underline">{l.label}</a>
          </li>
        ))}
      </ul>
    </main>
  );
}

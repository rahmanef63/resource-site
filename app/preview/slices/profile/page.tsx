"use client";

import { Resume, AboutProfile } from "@/features/profile";

// Live preview: both variants on the bundled placeholder identity.
// Real data: configureResume(cv) / configureAbout(card) at boot.

export default function ProfilePreview() {
  return (
    <div className="grid h-dvh w-full grid-cols-1 gap-4 overflow-auto p-4 lg:grid-cols-[1fr_minmax(360px,420px)]">
      <div className="min-h-0 overflow-auto rounded-lg border">
        <Resume />
      </div>
      <div className="min-h-0 overflow-auto rounded-lg border">
        <AboutProfile />
      </div>
    </div>
  );
}

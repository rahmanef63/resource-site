"use client";

import { AboutProfile } from "@/features/about-profile";

// Live preview: the identity card on the bundled generic mock person.
// Real identity: configureAbout({ name, roles, description, links, faq, ... }).

export default function AboutProfilePreview() {
  return (
    <div className="h-dvh w-full">
      <AboutProfile />
    </div>
  );
}

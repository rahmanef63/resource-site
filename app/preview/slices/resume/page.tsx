"use client";

import { Resume } from "@/features/resume";

// Live preview: the CV rendered from the bundled generic placeholder profile.
// Real data: configureResume(myProfile) at boot — the component re-renders it.

export default function ResumePreview() {
  return (
    <div className="h-dvh w-full">
      <Resume />
    </div>
  );
}

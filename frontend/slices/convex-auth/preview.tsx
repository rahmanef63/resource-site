"use client";
/** Variant preview (VP wave) — rr-internal, stripped on `rr add`. */

import type { SlicePreviewModule } from "@/shared/preview/types";
import { AuthCard, type AuthMethod } from "./components/AuthCard";

const METHOD_SETS: Record<string, ReadonlyArray<AuthMethod>> = {
  "password-google": ["password", "google"],
  "magic-link": ["google", "magic-link"],
  all: ["google", "github", "password", "anonymous"],
};

const preview: SlicePreviewModule = {
  AuthCard: ({ variant }) => {
    const methods =
      METHOD_SETS[variant.methods ?? "password-google"] ??
      METHOD_SETS["password-google"];
    const mode =
      (variant.defaultPasswordMode as "signin" | "signup") ?? "signin";
    return (
      <div className="p-4">
        <div className="mx-auto max-w-sm">
          <AuthCard
            methods={methods}
            defaultPasswordMode={mode}
            title="Welcome back"
            description="Sign in to continue. Handlers are mocked — submit resolves ok."
          />
        </div>
      </div>
    );
  },
};

export default preview;

"use client";

import * as React from "react";
import { SlicePreviewLayout } from "@/components/slice-previews/preview-layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AuthCard, type AuthMethod } from "@/features/convex-auth";

/** One props-driven <AuthCard> rendered with different `methods`. Every
 *  handler defaults to a mock that resolves ok, so each tab is fully
 *  interactive with no Convex backend. */
const VARIANTS: {
  value: string;
  tab: string;
  title: string;
  description: string;
  methods: AuthMethod[];
}[] = [
  { value: "magic", tab: "Magic link", title: "Magic link", description: "Passwordless — we email a one-tap sign-in link.", methods: ["magic-link"] },
  { value: "password", tab: "Email + password", title: "Email & password", description: "Sign in or create an account.", methods: ["password"] },
  { value: "google", tab: "Google", title: "Continue with Google", description: "One-tap OAuth sign-in.", methods: ["google"] },
  { value: "phone", tab: "Phone", title: "Phone number", description: "We text a 6-digit verification code.", methods: ["phone"] },
  { value: "combined", tab: "Combined", title: "Welcome back", description: "OAuth + email/password in one card.", methods: ["google", "github", "password"] },
];

export default function Page() {
  return (
    <SlicePreviewLayout
      title="Convex Auth — Multi-Provider Sign-in"
      kind="backend"
      description="One props-driven <AuthCard> rendered with different `methods`. @convex-dev/auth, self-hosted friendly. No Clerk."
      sourceUrl="https://github.com/rahmanef63/resource-site/tree/main/frontend/slices/convex-auth"
    >
      <Tabs defaultValue="magic" className="w-full">
        <TabsList className="flex h-auto w-full flex-wrap justify-start">
          {VARIANTS.map((v) => (
            <TabsTrigger key={v.value} value={v.value}>{v.tab}</TabsTrigger>
          ))}
        </TabsList>
        {VARIANTS.map((v) => (
          <TabsContent key={v.value} value={v.value}>
            <div className="flex min-h-[60vh] items-start justify-center pt-6">
              <AuthCard
                className="w-full max-w-sm"
                methods={v.methods}
                title={v.title}
                description={v.description}
              />
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </SlicePreviewLayout>
  );
}

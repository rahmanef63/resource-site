"use client";

import { ConvexAuthNextjsProvider } from "@convex-dev/auth/nextjs";
import { ConvexReactClient } from "convex/react";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import * as React from "react";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ConvexAuthNextjsProvider client={convex}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        {children}
        <Toaster richColors closeButton position="bottom-right" />
      </ThemeProvider>
    </ConvexAuthNextjsProvider>
  );
}

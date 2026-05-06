import type { Metadata } from "next";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import Providers from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "App", template: "%s · App" },
  description: "Built with the resources/ kitab template.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ConvexAuthNextjsServerProvider>
      <html lang="en" suppressHydrationWarning>
        <body>
          <Providers>{children}</Providers>
        </body>
      </html>
    </ConvexAuthNextjsServerProvider>
  );
}

import type { Metadata } from "next";
import { Suspense } from "react";
import { Inter } from "next/font/google";
import { ConvexClientProvider } from "@/components/convex-provider";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: { default: "__APP_NAME__", template: "%s — __APP_NAME__" },
  description: "Built with rahman-resources kitab.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Suspense fallback={null}>
          <ConvexClientProvider>{children}</ConvexClientProvider>
        </Suspense>
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import localFont from "next/font/local";
import { AnimatePresence } from "motion/react";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ThemeProvider } from "@/src/components/theme-provider";
import { Toaster } from "sonner";
import "./globals.css";
import { TooltipProvider } from "@/src/components/ui/tooltip";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

<meta name="apple-mobile-web-app-title" content="Nomen" />;

export const metadata: Metadata = {
  title: "Nomen",
  description:
    "A parser for every name listed on a social security card between 1880-2023, tabulated from the United States Social Security Adminstration's data.",
  openGraph: {
    title: "Nomen",
    description:
      "A parser for every name listed on a social security card between 1880-2023, tabulated from the United States Social Security Adminstration's data.",
    url: "https://nomen.aram.sh",
    siteName: "Nomen",
    images: [
      {
        url: "https://nomen.aram.sh/brand/og.png",
        width: 1200,
        height: 630,
        alt: "Nomen",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <AnimatePresence>
            <TooltipProvider>{children}</TooltipProvider>
          </AnimatePresence>
          <Toaster />
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}

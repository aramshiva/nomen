import type { Metadata } from "next";
import localFont from "next/font/local";
import { AnimatePresence } from "motion/react";
import "./globals.css";

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

export const metadata: Metadata = {
  title: "Names",
  description:
    "A parser for every name listed on a social security card between 1880-2023, tabulated from the United States Social Security Adminstration's data.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AnimatePresence>{children}</AnimatePresence>
      </body>
    </html>
  );
}

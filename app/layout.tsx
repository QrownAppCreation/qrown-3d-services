import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Syne, Newsreader } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import ChatWidget from "@/components/ChatWidget";
import { StickyMobileCTA } from "@/components/StickyMobileCTA";
import { TRPCProvider } from "@/components/providers/TRPCProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/* Hero banner fonts */
const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  weight: ["300", "400"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "WedPrint — Custom 3D Printed Wedding Keepsakes",
  description:
    "Beautifully personalised 3D printed cake toppers, bridal gifts, and wedding favours. Upload your photos, we handle the rest.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${syne.variable} ${newsreader.variable} antialiased`}
      >
        <TRPCProvider>
          {children}
          <Toaster position="top-right" richColors />
          <Analytics />
          <SpeedInsights />
          <ChatWidget />
          <StickyMobileCTA />
        </TRPCProvider>
      </body>
    </html>
  );
}

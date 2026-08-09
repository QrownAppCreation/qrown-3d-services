import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Syne, Newsreader } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Script from "next/script";
import ChatWidget from "@/components/ChatWidget";
import { StickyMobileCTA } from "@/components/StickyMobileCTA";
import { TRPCProvider } from "@/components/providers/TRPCProvider";
// PHASE 2 — captures ?ref=<partner-slug> on any landing page.
import { PartnerRefCapture } from "@/components/PartnerRefCapture";

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
      <head>
        {/* Meta Pixel — Quincy_Facebook_test (ID: 3689367491227874) */}
        <Script id="meta-pixel" strategy="afterInteractive">{`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '3689367491227874');
          fbq('track', 'PageView');
        `}</Script>
        <noscript>
          <img height="1" width="1" style={{display:"none"}}
            src="https://www.facebook.com/tr?id=3689367491227874&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${syne.variable} ${newsreader.variable} antialiased`}
      >
        <TRPCProvider>
          <PartnerRefCapture />
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

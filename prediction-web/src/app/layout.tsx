import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { GoogleOneTapInitializer } from "@/components/GoogleOneTapInitializer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap", // Optimize font loading: show fallback immediately, swap when font loads
  preload: true, // Preload font for better performance
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: "神預測 Prediction God",
  description: "預測市場平台 - 預測未來，贏得獎勵",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/images/logo.png", type: "image/png", sizes: "any" },
    ],
    shortcut: "/favicon.ico",
    apple: "/images/logo.png",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
    viewportFit: "cover",
  },
  other: {
    // 允許在 iframe 中正常運作（Threads、LINE 等內嵌瀏覽器）
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Get API base URL for preconnect (if available)
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';

  return (
    <html lang="zh-TW">
      <head>
        {/* Preconnect to API for faster requests */}
        {apiBaseUrl && (
          <>
            <link rel="preconnect" href={apiBaseUrl} crossOrigin="anonymous" />
            <link rel="dns-prefetch" href={apiBaseUrl} />
          </>
        )}
        
        {/* Preload critical resources */}
        <link rel="preload" href="/images/logo.png" as="image" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <GoogleOneTapInitializer />
        {children}
      </body>
    </html>
  );
}

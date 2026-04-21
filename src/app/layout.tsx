import type { Metadata } from "next";
import { Noto_Serif, Manrope } from "next/font/google";
import "./globals.css";

const notoSerif = Noto_Serif({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const manrope = Manrope({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "운 다아라 — 당신의 행운 안내자, AI 맞춤 운세·타로·손금",
  description:
    "당신의 행운 안내자, 운 다아라. AI가 매일 좋은 기운과 함께 타로·사주·손금을 봐드려요. 오늘의 운세, 별자리 궁합, 재물운까지.",
  keywords:
    "AI 타로, 오늘의 운세, 사주, 손금, 관상, 별자리 운세, 궁합, 재물운, 무료 운세",
  authors: [{ name: "운 다아라" }],
  openGraph: {
    type: "website",
    title: "운 다아라 — 당신의 행운 안내자",
    description:
      "AI가 매일 좋은 기운과 함께 타로·운세·손금을 봐드려요. 무료로 바로 시작하세요!",
    url: "https://undaara.com/",
    siteName: "운 다아라",
    locale: "ko_KR",
  },
  twitter: {
    card: "summary_large_image",
    title: "운 다아라 — 당신의 행운 안내자",
    description: "AI가 매일 좋은 기운과 함께 타로·운세·손금을 봐드려요.",
  },
  other: {
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "apple-mobile-web-app-title": "운 다아라",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${notoSerif.variable} ${manrope.variable}`}>
      <head>
        <meta name="theme-color" content="#0c1321" />
      </head>
      <body className="min-h-screen bg-[#0c1321] text-[#e8e6e1] font-sans antialiased">
        {children}
      </body>
    </html>
  );
}

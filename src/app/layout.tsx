import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ITIL 5 Trainer - AI-Powered Study & Exam Practice",
  description: "Master the ITIL Product (Version 5) certification with AI-generated study topics, visual explainers, video animations, and 25+ random practice exam sets with readiness assessment.",
  keywords: ["ITIL 5", "ITIL Product", "certification", "exam practice", "AI study", "ITIL trainer"],
  authors: [{ name: "ITIL 5 Trainer" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "ITIL 5 Trainer",
    description: "AI-powered ITIL Product v5 study and exam practice system",
    siteName: "ITIL 5 Trainer",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ITIL 5 Trainer",
    description: "AI-powered ITIL Product v5 study and exam practice system",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}

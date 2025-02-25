// src/app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { MainNav } from "@/components/navigation/MainNav"; // Use the original path
import { PageTransition } from "@/components/navigation/PageTransition";
import './globals.css'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lacoste SEO Tools",
  description: "A collection of tools for Lacoste's SEO team",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <MainNav />
        <PageTransition>
          {children}
        </PageTransition>
      </body>
    </html>
  );
}
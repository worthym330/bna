import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { CookieBanner } from "@/components/CookieBanner";
import { Analytics } from "@/components/Analytics";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: "%s | Invoq",
    default: "Invoq - Modern Billing Operations for Scaling Teams",
  },
  description: "Invoq is the premier SaaS platform for automated billing, client maintenance, and project tracking. Manage credit notes, track projects, and handle all financial communication from a single, powerful dashboard.",
  keywords: ["billing", "client maintenance", "invoicing", "credit notes", "email automation", "SaaS", "finance", "project tracking", "business operations"],
  openGraph: {
    title: "Invoq - Modern Billing & Maintenance",
    description: "Invoq is the premier SaaS platform for automated billing, client maintenance, and project tracking. Manage credit notes, track projects, and handle all financial communication from a single, powerful dashboard.",
    url: "https://invoq.com",
    siteName: "Invoq",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
      }
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Invoq - Modern Billing & Maintenance",
    description: "Invoq is the premier SaaS platform for automated billing, client maintenance, and project tracking. Manage credit notes, track projects, and handle all financial communication from a single, powerful dashboard.",
    images: ["/og-image.jpg"],
  },
  icons: {
    icon: "/favicon.ico",
  }
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster position="top-right" richColors />
        <CookieBanner />
        <Analytics />
      </body>
    </html>
  );
}

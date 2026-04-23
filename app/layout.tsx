import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const baseUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : `http://localhost:${process.env.PORT || 5000}`);

const imageUrl = `${baseUrl}/thumbnail.png`;

export const metadata: Metadata = {
  title: {
    default: "BillForge — Smart GST Billing Software for India | by Meld Techo",
    template: "%s | BillForge",
  },
  description:
    "BillForge is India's smartest GST billing SaaS by Meld Techo. Create GST-compliant invoices, manage multiple branches, track purchases, and file returns — all from one powerful dashboard. Start your 15-day free trial today.",
  keywords: [
    "GST billing software India",
    "GST invoice generator",
    "BillForge",
    "Meld Techo",
    "multi-branch GST billing",
    "Indian invoicing SaaS",
    "GST compliant invoicing",
    "online invoice maker India",
    "CGST SGST IGST calculator",
    "GST SaaS India",
    "purchase tracking India",
    "billing software for traders",
    "GST return software",
    "HSN code invoice",
    "cloud billing India",
  ],
  authors: [{ name: "Meld Techo", url: "http://meldtecho.com/" }],
  creator: "Meld Techo",
  publisher: "Meld Techo",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-snippet": -1, "max-image-preview": "large" },
  },
  openGraph: {
    title: "BillForge — India's Smartest GST Billing Platform",
    description:
      "Create GST-compliant invoices, manage multi-branch businesses, track purchases & generate reports. 15-day free trial. A product of Meld Techo.",
    url: baseUrl,
    siteName: "BillForge",
    images: [{ url: imageUrl, width: 1200, height: 630, alt: "BillForge — GST Billing by Meld Techo" }],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BillForge — India's Smartest GST Billing Platform",
    description:
      "GST-compliant invoicing, multi-branch management, real-time reports. 15-day free trial. Built by Meld Techo for Indian businesses.",
    images: [imageUrl],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-32x32.png",
    apple: "/apple-touch-icon.png",
  },
  metadataBase: new URL(baseUrl),
  alternates: { canonical: baseUrl },
  category: "technology",
};

export function generateViewport() {
  return {
    themeColor: "#1957bc",
    colorScheme: "light",
    width: "device-width",
    initialScale: 1,
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-IN">
      <head>
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "BillForge",
              applicationCategory: "BusinessApplication",
              operatingSystem: "Web",
              description:
                "India's smartest GST billing SaaS platform. Create GST-compliant invoices, manage multi-branch businesses, track purchases, and more.",
              offers: [
                { "@type": "Offer", price: "999", priceCurrency: "INR", name: "Starter" },
                { "@type": "Offer", price: "2499", priceCurrency: "INR", name: "Professional" },
                { "@type": "Offer", price: "5999", priceCurrency: "INR", name: "Enterprise" },
              ],
              publisher: {
                "@type": "Organization",
                name: "Meld Techo",
                url: "http://meldtecho.com/",
                contactPoint: { "@type": "ContactPoint", telephone: "+91-93110-66483", contactType: "customer support" },
              },
            }),
          }}
        />
      </head>
      <body className={`${inter.variable} antialiased`}>{children}</body>
    </html>
  );
}

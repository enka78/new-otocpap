import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Dönüşüm Medikal - CPAP ve Solunum Cihazları",
    template: "%s | Dönüşüm Medikal"
  },
  description: "20 yıllık tecrübemizle CPAP, BiPAP ve solunum cihazları satışı ve teknik desteği. Uyku apnesi ve KOAH hastaları için profesyonel çözümler.",
  keywords: ["cpap", "cpap cihazı", "otomatik cpap", "bipap", "uyku apnesi", "koah", "solunum cihazı", "maske", "burun maskesi", "dönüşüm medikal"],
  authors: [{ name: "Dönüşüm Medikal" }],
  creator: "Dönüşüm Medikal",
  publisher: "Dönüşüm Medikal",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    url: 'https://donusummedikal.com',
    title: 'Dönüşüm Medikal - CPAP ve Solunum Cihazları',
    description: '20 yıllık tecrübemizle CPAP, BiPAP ve solunum cihazları satışı ve teknik desteği. Uyku apnesi ve KOAH hastaları için profesyonel çözümler.',
    siteName: 'Dönüşüm Medikal',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Dönüşüm Medikal - CPAP ve Solunum Cihazları',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dönüşüm Medikal - CPAP ve Solunum Cihazları',
    description: '20 yıllık tecrübemizle CPAP, BiPAP ve solunum cihazları satışı ve teknik desteği.',
    images: ['/og-image.jpg'],
  },
  verification: {
    google: 'your-google-site-verification-code',
  },
  alternates: {
    canonical: 'https://donusummedikal.com',
    languages: {
      'tr-TR': 'https://donusummedikal.com/tr',
      'en-US': 'https://donusummedikal.com/en',
    },
  },
  category: 'healthcare',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <head>
        {/* Essential Meta Tags */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
        <meta name="language" content="Turkish" />
        <meta name="revisit-after" content="7 days" />
        <meta name="distribution" content="web" />
        <meta name="rating" content="general" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="msapplication-TileColor" content="#ffffff" />
        
        {/* Geographic Meta Tags */}
        <meta name="geo.region" content="TR" />
        <meta name="geo.country" content="Turkey" />
        <meta name="ICBM" content="41.0082, 28.9784" />
        
        {/* Dublin Core Meta Tags */}
        <meta name="DC.title" content="Dönüşüm Medikal - CPAP ve Solunum Cihazları" />
        <meta name="DC.creator" content="Dönüşüm Medikal" />
        <meta name="DC.subject" content="CPAP, BiPAP, Solunum Cihazları, Uyku Apnesi" />
        <meta name="DC.description" content="20 yıllık tecrübemizle CPAP, BiPAP ve solunum cihazları satışı ve teknik desteği." />
        <meta name="DC.language" content="tr" />
        
        {/* Favicon and Icons */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        
        {/* Preconnect for Performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        
        {/* DNS Prefetch */}
        <link rel="dns-prefetch" href="//www.google-analytics.com" />
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        
        {/* Google tag (gtag.js) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-17674804846"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'AW-17674804846');
          `}
        </Script>

        {/* Structured Data for SEO */}
        <Script
          id="structured-data"
          type="application/ld+json"
          strategy="afterInteractive"
        >
          {`
            {
              "@context": "https://schema.org",
              "@type": "MedicalBusiness",
              "name": "Dönüşüm Medikal",
              "description": "20 yıllık tecrübemizle CPAP, BiPAP ve solunum cihazları satışı ve teknik desteği. Uyku apnesi ve KOAH hastaları için profesyonel çözümler.",
              "url": "https://donusummedikal.com",
              "logo": "https://donusummedikal.com/logo.png",
              "image": "https://donusummedikal.com/og-image.jpg",
              "telephone": "+90-XXX-XXX-XXXX",
              "email": "info@donusummedikal.com",
              "address": {
                "@type": "PostalAddress",
                "addressCountry": "TR",
                "addressLocality": "Istanbul",
                "addressRegion": "Istanbul"
              },
              "openingHours": "Mo-Fr 09:00-18:00",
              "medicalSpecialty": "Sleep Medicine Equipment",
              "serviceType": "CPAP and Respiratory Equipment Sales and Support",
              "hasOfferCatalog": {
                "@type": "OfferCatalog",
                "name": "CPAP ve Solunum Cihazları",
                "itemListElement": [
                  {
                    "@type": "Offer",
                    "itemOffered": {
                      "@type": "Product",
                      "name": "CPAP Cihazları",
                      "description": "Uyku apnesi tedavisi için CPAP cihazları"
                    }
                  },
                  {
                    "@type": "Offer",
                    "itemOffered": {
                      "@type": "Product",
                      "name": "BiPAP Cihazları",
                      "description": "KOAH ve solunum yetmezliği için BiPAP cihazları"
                    }
                  }
                ]
              },
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.8",
                "reviewCount": "120"
              }
            }
          `}
        </Script>
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dönüşüm Medikal - CPAP ve Solunum Cihazları",
  description: "20 yıllık tecrübemizle CPAP, BiPAP ve solunum cihazları satışı ve teknik desteği. Uyku apnesi ve KOAH hastaları için profesyonel çözümler.",
  keywords: "cpap, cpap cihazı, otomatik cpap, bipap, uyku apnesi, koah, solunum cihazı, maske, burun maskesi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}

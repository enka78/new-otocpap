import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: "OtoCPAP Admin Panel",
  description: "OtoCPAP Yönetim Sistemi",
};

export default function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body className="antialiased">{children}</body>
    </html>
  );
}

import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { Inter } from "next/font/google";
import "../globals.css";
import { CartProvider } from "@/contexts/CartContext";
import GlobalToast from "@/components/GlobalToast";
import { AuthErrorBoundary } from "@/components/AuthErrorBoundary";

const inter = Inter({ subsets: ["latin"] });

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages();

  console.log("Locale during SSR:", locale);

  return (
    <html lang={locale}>
      <body className="antialiased">
        <NextIntlClientProvider messages={messages}>
          <AuthErrorBoundary>
            <CartProvider>
              {children}
              <GlobalToast />
            </CartProvider>
          </AuthErrorBoundary>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { Inter } from 'next/font/google';
import '../globals.css';
import { CartProvider } from '@/contexts/CartContext';
import { CategoriesAndBrandsProvider } from '@/contexts/CategoriesAndBrandsContext';
import GlobalToast from '@/components/GlobalToast';

const inter = Inter({ subsets: ['latin'] });

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className={inter.className}>
        <NextIntlClientProvider messages={messages}>
          <CategoriesAndBrandsProvider>
            <CartProvider>
              {children}
              <GlobalToast />
            </CartProvider>
          </CategoriesAndBrandsProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
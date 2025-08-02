
import {getRequestConfig} from 'next-intl/server';

// Can be imported from a shared config
const locales = ['tr', 'en'] as const;

export default getRequestConfig(async ({requestLocale}) => {
  // This typically corresponds to the `[locale]` segment
  let locale = await requestLocale;

  // Ensure that a valid locale is used
  if (!locale || !locales.includes(locale as 'tr' | 'en')) {
    locale = 'tr';
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default
  };
});
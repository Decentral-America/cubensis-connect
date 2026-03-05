import * as extension from 'extensionizer';
import allLocales from '../copied/_locales/index.json';
const existingLocaleCodes: string[] = allLocales.map((locale: { code: string }) =>
  locale.code.toLowerCase().replace('_', '-'),
);

export async function getFirstLangCode(): Promise<string | undefined> {
  const langCodes = await new Promise<string[]>((resolve) => {
    extension.i18n.getAcceptLanguages(resolve);
  });
  return langCodes
    .map((code: string) => code.toLowerCase())
    .find((code: string) => existingLocaleCodes.includes(code));
}

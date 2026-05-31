const DEFAULT_LOCALE = "en";

export function getRelativeLocaleUrl(locale: string = DEFAULT_LOCALE, path: string = ""): string {
  const base = locale === DEFAULT_LOCALE ? "" : `/${locale}`;
  return path ? `${base}/${path}` : base;
}

import config from "@/config";

const DEFAULT_LOCALE = config.site.lang || "en";

export function getRelativeLocaleUrl(locale: string = DEFAULT_LOCALE, path: string = ""): string {
  const base = locale === DEFAULT_LOCALE ? "" : `/${locale}`;
  return path ? `${base}/${path}` : base;
}

export function getAbsoluteLocaleUrl(locale: string = DEFAULT_LOCALE, path: string = ""): string {
  const relativeUrl = getRelativeLocaleUrl(locale, path);
  return new URL(relativeUrl, config.site.url).toString();
}

export function getLocalePath(path: string, locale: string = DEFAULT_LOCALE): string {
  return getRelativeLocaleUrl(locale, path);
}

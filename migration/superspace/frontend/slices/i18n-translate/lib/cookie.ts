// googtrans cookie format: `/<source>/<target>`. When target equals source,
// Google leaves the page untranslated. Cross-subdomain share so api.* and
// dash.* honour the same choice — skipped on bare hostnames (localhost, IPs).
export function setCookieLang(pageLang: string, lang: string): void {
  if (typeof document === "undefined") return;
  const value = `/${pageLang}/${lang}`;
  document.cookie = `googtrans=${value};path=/;samesite=lax`;
  if (location.hostname.includes(".")) {
    const root = location.hostname.split(".").slice(-2).join(".");
    document.cookie = `googtrans=${value};path=/;domain=.${root};samesite=lax`;
  }
}

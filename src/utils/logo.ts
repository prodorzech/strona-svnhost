// Maps accent colors to logo files
const ACCENT_LOGO_MAP: Record<string, string> = {
  '#ef4444': '/logomain.png',  // red (default)
  '#3b82f6': '/logo2.png',     // blue
  '#22c55e': '/logo3.png',     // green
  '#a855f7': '/logo4.png',     // purple
  '#f59e0b': '/logo5.png',     // yellow/amber
  '#06b6d4': '/logo1.png',     // cyan
};

export function getLogoForAccent(accentColor?: string): string {
  if (accentColor && ACCENT_LOGO_MAP[accentColor]) {
    return ACCENT_LOGO_MAP[accentColor];
  }
  return '/logomain.png';
}

export function updateFavicon(accentColor?: string) {
  const logoUrl = getLogoForAccent(accentColor);
  let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
  }
  link.type = 'image/png';
  link.href = logoUrl;
}

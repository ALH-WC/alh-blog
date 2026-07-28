// Link-preview metadata shared by every page: the branded 1200x630 card in
// /public/og plus the large-image twitter card. Page title and description
// are inherited by og:title / og:description automatically, so pages only
// name their card. Absolute URLs on the staging domain so shared links
// unfurl today; flip OG_BASE to https://amsterdamlifehomes.com at cutover.
const OG_BASE = 'https://alh-website.vercel.app';

export function shareMeta(card: string) {
  const img = `${OG_BASE}/og/${card}.jpg`;
  return {
    openGraph: {
      siteName: 'Amsterdam Life Homes',
      type: 'website' as const,
      images: [{ url: img, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image' as const,
      images: [img],
    },
  };
}

import imageUrlBuilder from '@sanity/image-url';
import type { SanityImageSource } from '@sanity/image-url/lib/types/types';
import { dataset, projectId, isSanityConfigured } from '../env';

const builder = isSanityConfigured
  ? imageUrlBuilder({ projectId, dataset })
  : null;

// Resolve a Sanity image ref to a URL builder. Falls back to null when
// unconfigured or when the source is missing, so components can use a
// placeholder instead.
export function urlForImage(source: SanityImageSource | undefined | null) {
  if (!builder || !source || !(source as { asset?: unknown }).asset) return null;
  return builder.image(source).auto('format').fit('max');
}

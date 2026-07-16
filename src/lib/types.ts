import type { PortableTextBlock } from '@portabletext/types';
import type { Category } from './sections';

export type { Category } from './sections';

export interface Faq {
  question: string;
  answer: string;
}

export interface Article {
  _id: string;
  title: string;
  /** Standfirst / excerpt. Shown as the card excerpt and the article lead. */
  dek: string;
  slug: string;
  category: Category;
  readMinutes: number;
  /** Marks the flagship "Start here" article at the very top of the index. */
  featured: boolean;
  /** Resolved hero image URL (Sanity CDN or picsum placeholder). */
  imageUrl: string;
  imageAlt: string;
  /** Portable Text body. May be empty for list-only sample items. */
  body: PortableTextBlock[];

  // SEO
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  ogImageUrl?: string;
  noIndex?: boolean;

  // AI / answer engines (GEO / AI-EO)
  summary?: string;
  keyTakeaways?: string[];
  faqs?: Faq[];

  // Placement / structured data
  categories?: Category[];
  /** Not displayed; used only in JSON-LD as a freshness signal. */
  publishedAt?: string;
}

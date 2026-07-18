import type { PortableTextBlock } from '@portabletext/types';
import type { Category } from './sections';

export type { Category } from './sections';

/**
 * The card-level slice of an article: everything the index, the map tips and
 * the related-article rails need, and nothing more. The index passes the whole
 * list into a client component, and Next serializes those props into the HTML;
 * with full articles that made the page carry two megabytes of invisible
 * bodies, FAQs and metadata.
 */
export interface ArticleListItem {
  _id: string;
  title: string;
  dek: string;
  slug: string;
  category: Category;
  categories?: Category[];
  readMinutes: number;
  sectionHero: boolean;
  imageUrl: string;
  imageAlt: string;
}

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
  /** Pins the article as the big feature card of its chapter block. */
  sectionHero: boolean;
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
  /** Hand-picked "Keep reading" slugs from the Studio; auto picks fill the rest. */
  relatedSlugs?: string[];
}

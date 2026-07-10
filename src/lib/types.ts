import type { PortableTextBlock } from '@portabletext/types';

export type Audience = 'singles_couples' | 'family' | 'both';

export type Category =
  | 'Immigration'
  | 'Work'
  | 'Need to know'
  | 'Finance'
  | 'Neighborhoods'
  | 'Life & Culture'
  | 'Eat & Drink'
  | 'See & Do';

export interface Article {
  _id: string;
  title: string;
  dek: string;
  slug: string;
  category: Category;
  stage: 1 | 2 | 3 | 4 | 5;
  readMinutes: number;
  audience: Audience;
  featured: boolean;
  /** Resolved hero image URL (Sanity CDN or picsum placeholder). */
  imageUrl: string;
  imageAlt: string;
  /** Portable Text body. May be empty for list-only sample items. */
  body: PortableTextBlock[];
}

export interface Stage {
  number: 1 | 2 | 3 | 4 | 5;
  title: string;
  dek: string;
  /** Category slug used for the stage's "View all" link. */
  viewAllHref: string;
}

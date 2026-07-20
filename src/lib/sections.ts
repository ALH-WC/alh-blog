// The blog's taxonomy for the redesigned (category) guide.
//
// `CATEGORIES` are the specific labels shown as the small eyebrow on each card.
// `SECTIONS` are the chapters shown in the sticky menu and as the big Spectral
// chapter titles; each chapter gathers one or more categories.
//
// A chapter only renders five cards, and its "View all" filters by the whole
// chapter, so a category folded into a crowded chapter can end up invisible. Food
// & Drink used to sit inside Life & culture and none of its articles reached the
// top five, which is why it now has a chapter of its own.

export const CATEGORIES = [
  'Immigration',
  'Housing',
  'Neighborhoods',
  'Eat & Drink',
  'Finance & Work',
  'Life & Culture',
] as const;

export type Category = (typeof CATEGORIES)[number];

// The taxonomy used to have more granular labels. Every article was migrated
// to the chapter-level categories above, but this map keeps the site tolerant
// of a stray legacy value (an old draft, an import) by folding it into the
// chapter it always belonged to.
export const LEGACY_CATEGORY_MAP: Record<string, Category> = {
  'Need to know': 'Housing',
  Work: 'Finance & Work',
  Finance: 'Finance & Work',
  'Finances & Work': 'Finance & Work',
  'See & Do': 'Life & Culture',
  'Food & Drink': 'Eat & Drink',
};

export const normalizeCategory = (c: string): Category =>
  (LEGACY_CATEGORY_MAP[c] ?? c) as Category;

export interface Section {
  /** Stable key, used for menu data attributes and scroll-spy. */
  key: string;
  /** Short label shown in the sticky category menu. */
  menu: string;
  /** Big Spectral chapter title shown above the chapter's cards. */
  title: string;
  /** Subtitle under the chapter title. */
  dek: string;
  /** Categories that appear inside this chapter. */
  categories: Category[];
}

// Order here is the order of the menu and of the chapters on the page.
export const SECTIONS: Section[] = [
  {
    key: 'immigration',
    menu: 'Immigration',
    title: 'Immigration',
    dek: 'Visas, timing, and the paperwork of arriving.',
    categories: ['Immigration'],
  },
  {
    key: 'housing',
    menu: 'Housing',
    title: 'Housing',
    dek: 'How this market really works, from people inside it daily.',
    categories: ['Housing'],
  },
  {
    key: 'neighborhoods',
    menu: 'Neighborhoods',
    title: 'The Neighborhoods',
    dek: 'Honest comparisons from weekly viewings across the city.',
    categories: ['Neighborhoods'],
  },
  {
    key: 'food',
    menu: 'Eat & Drink',
    title: 'Eat & Drink',
    dek: 'Where to eat, what to order, and the places locals go back to.',
    categories: ['Eat & Drink'],
  },
  {
    key: 'money',
    menu: 'Finance & Work',
    title: 'Finance & Work',
    dek: 'Real numbers, current rules, and how work fits in. No surprises.',
    categories: ['Finance & Work'],
  },
  {
    key: 'life',
    menu: 'Life & Culture',
    title: 'Life & Culture',
    dek: 'Seeing, doing, and the part that makes it home.',
    categories: ['Life & Culture'],
  },
];

// Reverse lookup: which chapter a given category belongs to.
export const CATEGORY_TO_SECTION: Record<Category, string> = SECTIONS.reduce(
  (acc, s) => {
    s.categories.forEach((c) => {
      acc[c] = s.key;
    });
    return acc;
  },
  {} as Record<Category, string>,
);

export function sectionForCategory(category: Category): Section | undefined {
  const key = CATEGORY_TO_SECTION[category];
  return SECTIONS.find((s) => s.key === key);
}

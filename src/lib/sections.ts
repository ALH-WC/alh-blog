// The blog's taxonomy for the redesigned (category) guide.
//
// `CATEGORIES` are the specific labels shown as the small eyebrow on each card.
// `SECTIONS` are the chapters shown in the sticky menu and as the big Spectral
// chapter titles; each chapter gathers one or more categories.
//
// A chapter only renders five cards, and its "View all" filters by the whole
// chapter, so a category folded into a crowded chapter can end up invisible. Eat
// & Drink used to sit inside Life & culture and none of its articles reached the
// top five, which is why it now has a chapter of its own.

export const CATEGORIES = [
  'Immigration',
  'Need to know',
  'Work',
  'Finance',
  'Neighborhoods',
  'Life & Culture',
  'Eat & Drink',
  'See & Do',
] as const;

export type Category = (typeof CATEGORIES)[number];

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
    categories: ['Need to know'],
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
    menu: 'Finances & Work',
    title: 'Finances & Work',
    dek: 'Real numbers, current rules, and how work fits in. No surprises.',
    categories: ['Finance', 'Work'],
  },
  {
    key: 'life',
    menu: 'Life & Culture',
    title: 'Life & Culture',
    dek: 'Seeing, doing, and the part that makes it home.',
    categories: ['Life & Culture', 'See & Do'],
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

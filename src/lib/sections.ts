// The blog's taxonomy for the redesigned (category) guide.
//
// `CATEGORIES` are the specific labels shown as the small terracotta eyebrow on
// each card. `SECTIONS` are the five chapters shown in the sticky menu and as the
// big Spectral chapter titles; each chapter gathers one or more categories.

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
  /** Chapter title split around a single terracotta accent word. */
  before: string;
  accent: string;
  after: string;
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
    before: '',
    accent: 'Immigrate',
    after: ' here',
    dek: 'Visas, timing, and the paperwork of arriving.',
    categories: ['Immigration'],
  },
  {
    key: 'housing',
    menu: 'Housing',
    before: 'The ',
    accent: 'home',
    after: ' search',
    dek: 'How this market really works, from people inside it daily.',
    categories: ['Need to know'],
  },
  {
    key: 'money',
    menu: 'Money & work',
    before: '',
    accent: 'Money',
    after: ' and work',
    dek: 'Real numbers, current rules, and how work fits in. No surprises.',
    categories: ['Finance', 'Work'],
  },
  {
    key: 'neighborhoods',
    menu: 'Neighborhoods',
    before: 'The ',
    accent: 'neighborhoods',
    after: '',
    dek: 'Honest comparisons from weekly viewings across the city.',
    categories: ['Neighborhoods'],
  },
  {
    key: 'life',
    menu: 'Life & culture',
    before: '',
    accent: 'Life',
    after: ' and culture',
    dek: 'Eating, drinking, seeing, and the part that makes it home.',
    categories: ['Life & Culture', 'Eat & Drink', 'See & Do'],
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

import type { Stage } from './types';

// The five journey stages. Titles are fixed by the client and must not be renamed.
// Kept independent of the Sanity schema module so client components can import it.
export const STAGES: Stage[] = [
  { number: 1, title: 'Preparing & arriving', dek: 'Visas, timing, and the first weeks on the ground', viewAllHref: '/blog/immigration' },
  { number: 2, title: 'The home search', dek: 'How this market really works, from people inside it daily', viewAllHref: '/blog/need-to-know' },
  { number: 3, title: 'Paperwork & money', dek: 'Real numbers, current rules, no surprises', viewAllHref: '/blog/finance' },
  { number: 4, title: 'The neighborhoods', dek: 'Honest comparisons from weekly viewings across the city', viewAllHref: '/blog/neighborhoods' },
  { number: 5, title: 'Living your best life', dek: 'The part that makes it home', viewAllHref: '/blog/life-and-culture' },
];

// Split accented "Stage title" into a plain part and an italic-accent tail,
// matching the prototype (e.g. "The home" + "search").
export const STAGE_ACCENT: Record<number, { head: string; tail: string }> = {
  1: { head: 'Preparing and', tail: 'arriving' },
  2: { head: 'The home', tail: 'search' },
  3: { head: 'Paperwork and', tail: 'money' },
  4: { head: 'The', tail: 'neighborhoods' },
  5: { head: 'Living your', tail: 'best life' },
};

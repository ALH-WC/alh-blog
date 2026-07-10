import type { PortableTextBlock } from '@portabletext/types';
import type { Article } from './types';

// Placeholder imagery from picsum (seeded), per the design handoff.
const img = (seed: string) => `https://picsum.photos/seed/${seed}/1200/800`;

let k = 0;
const key = () => `k${(k++).toString(36)}`;

function para(text: string): PortableTextBlock {
  return {
    _type: 'block',
    _key: key(),
    style: 'normal',
    markDefs: [],
    children: [{ _type: 'span', _key: key(), text, marks: [] }],
  } as PortableTextBlock;
}

function heading(text: string): PortableTextBlock {
  return {
    _type: 'block',
    _key: key(),
    style: 'h2',
    markDefs: [],
    children: [{ _type: 'span', _key: key(), text, marks: [] }],
  } as PortableTextBlock;
}

// A short, deliberately generic placeholder body for list items. Contains no
// figures or claims (client rule: no fabricated statistics). Replace via Sanity.
function stubBody(dek: string): PortableTextBlock[] {
  return [
    para(dek),
    para(
      'This guide is part of The Amsterdam Guide. We are moving our full library into the new system, and the complete version of this piece will appear here once it is published from the CMS.',
    ),
  ];
}

// The hero / flagship article, mirroring the approved 1a article prototype copy.
const rentingWithoutBsnBody: PortableTextBlock[] = [
  para(
    'Almost every expat hits the same wall in their first week. You cannot register for a BSN, the tax number you need for everything, without a Dutch address. And plenty of landlords say they will not rent to you until you have one. It feels like a locked door with the key inside.',
  ),
  para(
    'The good news is that the loop is not real. You can rent first. What most people are missing is that registration happens at the municipality after you sign, not before, and that a cooperative landlord is worth more than a perfect paper trail.',
  ),
  heading('The order that actually works'),
  para('Do these in sequence and the knot untangles itself. Skipping ahead is where people lose weeks.'),
  {
    _type: 'stepsCallout',
    _key: key(),
    steps: [
      { _type: 'step', _key: key(), lead: 'Sign a registrable lease.', text: 'Confirm in writing that the landlord allows registration at the address.' },
      { _type: 'step', _key: key(), lead: 'Book your municipality appointment.', text: 'Do this the day you sign. Slots fill fast in the city.' },
      { _type: 'step', _key: key(), lead: 'Register, then collect your BSN.', text: 'It arrives by post within a few working days.' },
    ],
  } as unknown as PortableTextBlock,
  {
    _type: 'pullQuote',
    _key: key(),
    quote: 'A landlord who lets you register is worth more than one who is a hundred euros cheaper.',
  } as unknown as PortableTextBlock,
  para(
    'If a listing refuses registration, walk away. It usually signals a bigger problem, and it will block your BSN, your bank, and your health insurance in one move.',
  ),
];

interface Seed {
  slug: string;
  title: string;
  dek: string;
  category: Article['category'];
  stage: Article['stage'];
  readMinutes: number;
  audience: Article['audience'];
  featured: boolean;
  seed: string;
  alt: string;
  order: number; // higher = newer, drives "The Latest"
  body?: PortableTextBlock[];
}

const seeds: Seed[] = [
  {
    slug: 'renting-without-bsn',
    title: 'Renting in Amsterdam without a BSN: the chicken-and-egg problem, solved',
    dek: 'Someone told you that you need a BSN to rent an apartment, and an apartment to get a BSN. One of those is true. Here is the actual sequence.',
    category: 'Need to know', stage: 2, readMinutes: 8, audience: 'both', featured: true,
    seed: 'canalgold', alt: 'Canal houses in Amsterdam at golden hour', order: 100, body: rentingWithoutBsnBody,
  },

  // Stage 1 - Preparing & arriving
  {
    slug: 'first-30-days',
    title: 'Your first 30 days in Amsterdam: the checklist that actually works',
    dek: 'BSN, bank account, health insurance, DigiD. The exact order to do things in, and what can wait.',
    category: 'Immigration', stage: 1, readMinutes: 9, audience: 'both', featured: true,
    seed: 'arrive', alt: 'Arrival at Amsterdam Centraal', order: 60,
  },
  {
    slug: 'registering-your-address-bsn',
    title: 'Registering at your address: how the BSN process really goes',
    dek: 'What happens at the municipality, in what order, and how long each step really takes.',
    category: 'Immigration', stage: 1, readMinutes: 6, audience: 'singles_couples', featured: false,
    seed: 'register', alt: 'Amsterdam municipality building', order: 90,
  },
  {
    slug: 'highly-skilled-migrant-thresholds',
    title: 'Highly skilled migrant salary thresholds, explained simply',
    dek: 'What the highly skilled migrant route asks for, in plain language.',
    category: 'Work', stage: 1, readMinutes: 7, audience: 'singles_couples', featured: false,
    seed: 'hsm', alt: 'Office desk in Amsterdam', order: 55,
  },
  {
    slug: 'moving-with-kids',
    title: 'Moving to Amsterdam with kids: schools, daycare, and waiting lists',
    dek: 'How the school and daycare system works for new arrivals, and when to get on lists.',
    category: 'Immigration', stage: 1, readMinutes: 11, audience: 'both', featured: false,
    seed: 'kids', alt: 'Children cycling in Amsterdam', order: 50,
  },
  {
    slug: 'going-freelance-zzp',
    title: 'Going freelance in the Netherlands: ZZP basics for expats',
    dek: 'The essentials of setting up as a ZZP freelancer when you have just arrived.',
    category: 'Work', stage: 1, readMinutes: 8, audience: 'singles_couples', featured: false,
    seed: 'zzp', alt: 'Freelancer working from an Amsterdam cafe', order: 40,
  },

  // Stage 2 - The home search
  {
    slug: 'apartments-disappear-48-hours',
    title: 'Why good apartments disappear in 48 hours, and how prepared renters move faster',
    dek: 'The speed of this market surprises everyone. How the winners see listings before they go public.',
    category: 'Need to know', stage: 2, readMinutes: 7, audience: 'singles_couples', featured: true,
    seed: 'aptspeed', alt: 'Amsterdam apartment viewing', order: 70,
  },
  {
    slug: 'what-landlords-look-for',
    title: 'What landlords actually look for in expat tenants',
    dek: 'The signals that move you to the top of a landlord’s list.',
    category: 'Need to know', stage: 2, readMinutes: 7, audience: 'singles_couples', featured: false,
    seed: 'landlords', alt: 'Landlord meeting a prospective tenant', order: 85,
  },
  {
    slug: 'rental-contracts-decoded',
    title: 'Rental contracts in the Netherlands, decoded',
    dek: 'The clauses that matter, and the ones you can safely ignore.',
    category: 'Need to know', stage: 2, readMinutes: 10, audience: 'singles_couples', featured: false,
    seed: 'contracts', alt: 'Signing a rental contract', order: 45,
  },
  {
    slug: 'deposit-rules-2026',
    title: 'Deposit rules in 2026 and how to actually get yours back',
    dek: 'What the current rules say about deposits, and how to leave on good terms.',
    category: 'Need to know', stage: 2, readMinutes: 6, audience: 'both', featured: false,
    seed: 'deposit', alt: 'Keys being handed over', order: 42,
  },
  {
    slug: 'fifteen-minute-viewing',
    title: 'The 15-minute viewing: spotting red flags fast',
    dek: 'How to read an apartment quickly when you only get a short slot.',
    category: 'Need to know', stage: 2, readMinutes: 5, audience: 'singles_couples', featured: false,
    seed: 'viewing', alt: 'Empty Amsterdam apartment during a viewing', order: 38,
  },

  // Stage 3 - Paperwork & money
  {
    slug: 'real-monthly-costs',
    title: 'Utilities, internet, and city taxes: your real monthly costs beyond rent',
    dek: 'The full picture of what an Amsterdam home costs per month beyond the rent itself.',
    category: 'Finance', stage: 3, readMinutes: 7, audience: 'singles_couples', featured: true,
    seed: 'costs', alt: 'Calculating monthly costs at home', order: 65,
  },
  {
    slug: '30-percent-ruling-2026',
    title: 'The 30% ruling in 2026 and what it means for your rent budget',
    dek: 'How the ruling works today, and how to think about it when you set a rent budget.',
    category: 'Finance', stage: 3, readMinutes: 8, audience: 'singles_couples', featured: false,
    seed: 'ruling', alt: 'Reviewing finances at a desk', order: 95,
  },
  {
    slug: 'dutch-bank-account-fast',
    title: 'Opening a Dutch bank account fast, even before you land',
    dek: 'The routes to a working Dutch account, including options you can start from abroad.',
    category: 'Finance', stage: 3, readMinutes: 5, audience: 'singles_couples', featured: false,
    seed: 'bank', alt: 'Banking on a phone', order: 48,
  },
  {
    slug: 'income-requirements-renting',
    title: 'Income requirements for renting: what agencies really check',
    dek: 'How agencies assess whether you qualify, and how to present your case.',
    category: 'Finance', stage: 3, readMinutes: 6, audience: 'both', featured: false,
    seed: 'income', alt: 'Paperwork for a rental application', order: 44,
  },
  {
    slug: 'dutch-health-insurance',
    title: 'Dutch health insurance: how to pick in one evening',
    dek: 'A simple way to choose a Dutch health insurance policy without losing a weekend to it.',
    category: 'Finance', stage: 3, readMinutes: 7, audience: 'both', featured: false,
    seed: 'health', alt: 'Comparing insurance options on a laptop', order: 41,
  },

  // Stage 4 - The neighborhoods
  {
    slug: 'oud-zuid-de-pijp-oost',
    title: 'Oud-Zuid vs De Pijp vs Oost: where do you actually belong?',
    dek: 'An honest comparison from the people who do viewings in all three every week.',
    category: 'Neighborhoods', stage: 4, readMinutes: 12, audience: 'singles_couples', featured: true,
    seed: 'depijp', alt: 'Street in De Pijp, Amsterdam', order: 80,
  },
  {
    slug: 'quiet-neighbourhoods-families',
    title: 'The quiet neighbourhoods families love (that tourists never see)',
    dek: 'Where families settle for space, schools, and calm streets.',
    category: 'Neighborhoods', stage: 4, readMinutes: 9, audience: 'both', featured: false,
    seed: 'quiet', alt: 'Quiet residential street in Amsterdam', order: 52,
  },
  {
    slug: 'living-in-noord',
    title: 'Living in Noord: the ferry life, honestly',
    dek: 'What it is really like to live across the IJ and commute by ferry.',
    category: 'Neighborhoods', stage: 4, readMinutes: 8, audience: 'singles_couples', featured: false,
    seed: 'noord', alt: 'The IJ ferry to Amsterdam Noord', order: 43,
  },
  {
    slug: 'zuidas-beyond-office-towers',
    title: 'Zuidas beyond the office towers',
    dek: 'The residential side of the business district, and who it suits.',
    category: 'Neighborhoods', stage: 4, readMinutes: 7, audience: 'singles_couples', featured: false,
    seed: 'zuidas', alt: 'Zuidas district at dusk', order: 39,
  },

  // Stage 5 - Living your best life
  {
    slug: 'make-dutch-friends',
    title: 'How to make Dutch friends (yes, really)',
    dek: 'Borrels, sports clubs, and the small habits that turn a city into a home.',
    category: 'Life & Culture', stage: 5, readMinutes: 6, audience: 'both', featured: true,
    seed: 'friends', alt: 'Friends on an Amsterdam terrace', order: 36,
  },
  {
    slug: 'brunch-beyond-tourist-spots',
    title: 'Brunch beyond the tourist spots: where locals actually go',
    dek: 'Neighbourhood cafes worth the cycle, away from the crowds.',
    category: 'Eat & Drink', stage: 5, readMinutes: 5, audience: 'singles_couples', featured: false,
    seed: 'brunch', alt: 'Neighbourhood brunch cafe', order: 34,
  },
  {
    slug: 'year-of-amsterdam-seasons',
    title: 'A year of Amsterdam seasons: what nobody tells you about winter',
    dek: 'How the city changes through the year, and how to make the most of each season.',
    category: 'See & Do', stage: 5, readMinutes: 6, audience: 'both', featured: false,
    seed: 'seasons', alt: 'Winter canal in Amsterdam', order: 32,
  },
];

export const sampleArticles: Article[] = seeds
  .sort((a, b) => b.order - a.order)
  .map((s) => ({
    _id: `sample-${s.slug}`,
    title: s.title,
    dek: s.dek,
    slug: s.slug,
    category: s.category,
    stage: s.stage,
    readMinutes: s.readMinutes,
    audience: s.audience,
    featured: s.featured,
    imageUrl: img(s.seed),
    imageAlt: s.alt,
    body: s.body ?? stubBody(s.dek),
  }));

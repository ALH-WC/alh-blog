import type { PortableTextBlock } from '@portabletext/types';
import type { Article, Category } from './types';

let k = 0;
const key = () => `k${(k += 1)}`;

function p(text: string): PortableTextBlock {
  return {
    _type: 'block',
    _key: key(),
    style: 'normal',
    markDefs: [],
    children: [{ _type: 'span', _key: key(), text, marks: [] }],
  } as unknown as PortableTextBlock;
}
function h2(text: string): PortableTextBlock {
  return {
    _type: 'block',
    _key: key(),
    style: 'h2',
    markDefs: [],
    children: [{ _type: 'span', _key: key(), text, marks: [] }],
  } as unknown as PortableTextBlock;
}
function quote(q: string): PortableTextBlock {
  return { _type: 'pullQuote', _key: key(), quote: q } as unknown as PortableTextBlock;
}
function callout(label: string, text: string): PortableTextBlock {
  return { _type: 'callout', _key: key(), label, text } as unknown as PortableTextBlock;
}
function steps(items: [string, string][]): PortableTextBlock {
  return {
    _type: 'stepsCallout',
    _key: key(),
    steps: items.map(([lead, text]) => ({ _key: key(), lead, text })),
  } as unknown as PortableTextBlock;
}

const bsnBody: PortableTextBlock[] = [
  p('This is the single question we are asked most often, and it is almost always framed as a trap. So let us take the trap apart. Here is the order we walk our own clients through, and why the part that scares people turns out to be the easy part.'),
  h2('What a BSN actually is'),
  p('The BSN, or burgerservicenummer, is your Dutch citizen service number. You need it for a job, for taxes, for health insurance, and for almost every piece of official admin you will ever do here. You receive it when you register your address at the municipality, the gemeente. That last detail is where the confusion begins.'),
  h2('The chicken and the egg'),
  p('The myth goes like this: landlords want a BSN before they will rent to you, and the gemeente wants an address before it will hand over a BSN. If both were true, no newcomer would ever get a home. They are not both true.'),
  p('Landlords and agents do not need your BSN. What they actually want is proof that you can pay: an employment contract or proof of income, sometimes a few months of savings, and a clean, complete application.'),
  quote('The order is the opposite of what everyone fears. You find the home first, and the number follows.'),
  h2('The order that actually works'),
  steps([
    ['Get your documents ready', 'Passport, employment contract or proof of income, and a short note introducing who you are.'],
    ['View and apply fast', 'Good apartments here are gone in days, so a complete application on the same day beats a perfect one a week later.'],
    ['Sign the lease', 'And get your move-in date in writing.'],
    ['Book a gemeente appointment', 'To register at your new address. Bring your lease and passport.'],
    ['Receive your BSN', 'Usually on the spot or within a few working days.'],
  ]),
  callout('Good to know', 'Arriving from abroad for a stay under four months? You may register as a non-resident (RNI) at a designated municipality instead. For a normal move, the five steps above are the ones you want.'),
  h2('A realistic timeline'),
  p('From first viewing to BSN in hand is often two to four weeks, and most of that is the search itself. Once the BSN lands, the rest of your admin tends to unlock quickly after it.'),
  p('You do not need to solve the whole system at once. You need the next step, in the right order.'),
];

interface Seed {
  title: string;
  dek: string;
  slug: string;
  category: Category;
  readMinutes: number;
  sectionHero?: boolean;
  body?: PortableTextBlock[];
}

const seeds: Seed[] = [
  { title: 'Renting in Amsterdam without a BSN: the chicken and egg problem, solved', dek: 'Someone told you that you need a BSN to rent, and an address to get a BSN. Only one of those is true. Here is the sequence that actually works.', slug: 'renting-without-bsn', category: 'Housing', readMinutes: 8, sectionHero: true, body: bsnBody },
  { title: 'Your first 30 days in Amsterdam: the checklist that actually works', dek: 'BSN, bank account, health insurance, DigiD. The exact order to do things in, and what can wait.', slug: 'first-30-days', category: 'Immigration', readMinutes: 9 },
  { title: 'Registering at your address: how the BSN process really goes', dek: 'What actually happens at the gemeente appointment, and what to bring.', slug: 'registering-your-address', category: 'Immigration', readMinutes: 6 },
  { title: 'Moving to Amsterdam with kids: schools, daycare, and waiting lists', dek: 'Schools, daycare, and the waiting lists nobody warns you about.', slug: 'moving-with-kids', category: 'Immigration', readMinutes: 11 },
  { title: 'Why good apartments disappear in 48 hours, and how prepared renters move faster', dek: 'The speed of this market surprises everyone. How the winners see listings before they go public.', slug: 'apartments-48-hours', category: 'Housing', readMinutes: 7 },
  { title: 'What landlords actually look for in expat tenants', dek: 'Income, documents, and the small things that decide who gets the keys.', slug: 'what-landlords-look-for', category: 'Housing', readMinutes: 7 },
  { title: 'Rental contracts in the Netherlands, decoded', dek: 'Fixed term, indefinite, diplomatic clause. What the contract types mean for you.', slug: 'rental-contracts-decoded', category: 'Housing', readMinutes: 10 },
  { title: 'Deposit rules in 2026 and how to actually get yours back', dek: 'What a landlord can and cannot hold back, and how to protect your deposit.', slug: 'deposit-rules-2026', category: 'Housing', readMinutes: 6 },
  { title: 'The 15-minute viewing: spotting red flags fast', dek: 'A quick checklist for the things that matter when you only have minutes.', slug: '15-minute-viewing', category: 'Housing', readMinutes: 5 },
  { title: 'Utilities, internet, and city taxes: your real monthly costs beyond rent', dek: 'The full picture of what an Amsterdam home costs per month beyond the rent itself.', slug: 'utilities-and-costs', category: 'Finances & Work', readMinutes: 7 },
  { title: 'The 30% ruling in 2026 and what it means for your rent budget', dek: 'How the ruling works now, and what it does to what you can afford.', slug: '30-percent-ruling', category: 'Finances & Work', readMinutes: 8 },
  { title: 'Income requirements for renting: what agencies really check', dek: 'The three-times-rent rule of thumb, and how strict it really is.', slug: 'income-requirements', category: 'Finances & Work', readMinutes: 6 },
  { title: 'Opening a Dutch bank account fast, even before you land', dek: 'The routes to a working Dutch account, including options you can start from abroad.', slug: 'dutch-bank-account', category: 'Finances & Work', readMinutes: 5 },
  { title: 'Dutch health insurance: how to pick in one evening', dek: 'A simple way to choose a policy without losing a weekend to it.', slug: 'dutch-health-insurance', category: 'Finances & Work', readMinutes: 7 },
  { title: 'Highly skilled migrant salary thresholds, explained simply', dek: 'The numbers that matter for the HSM permit, in plain language.', slug: 'hsm-thresholds', category: 'Finances & Work', readMinutes: 7 },
  { title: 'Going freelance in the Netherlands: ZZP basics for expats', dek: 'What ZZP means, and the first steps to working for yourself here.', slug: 'freelance-zzp', category: 'Finances & Work', readMinutes: 8 },
  { title: 'Oud-Zuid vs De Pijp vs Oost: where do you actually belong?', dek: 'An honest comparison from the people who do viewings in all three every week.', slug: 'oudzuid-depijp-oost', category: 'Neighborhoods', readMinutes: 12 },
  { title: 'The quiet neighbourhoods families love, that tourists never see', dek: 'Where families settle, and why.', slug: 'quiet-family-neighbourhoods', category: 'Neighborhoods', readMinutes: 9 },
  { title: 'Living in Noord: the ferry life, honestly', dek: 'The trade-offs of the north bank, from people who live there.', slug: 'living-in-noord', category: 'Neighborhoods', readMinutes: 8 },
  { title: 'Zuidas beyond the office towers', dek: 'What it is actually like to live in the business district.', slug: 'zuidas-beyond-offices', category: 'Neighborhoods', readMinutes: 7 },
  { title: 'How to make Dutch friends (yes, really)', dek: 'The unwritten rules of friendship here, and how to get past them.', slug: 'make-dutch-friends', category: 'Life & Culture', readMinutes: 6 },
  { title: 'Brunch beyond the tourist spots: where locals actually go', dek: 'The neighbourhood cafes worth your Saturday.', slug: 'brunch-beyond-tourists', category: 'Eat & Drink', readMinutes: 5 },
  { title: 'A year of Amsterdam seasons, and what nobody tells you about winter', dek: 'How the light, the weather, and the city change across the year.', slug: 'amsterdam-seasons', category: 'Life & Culture', readMinutes: 6 },
];

export const sampleArticles: Article[] = seeds.map((s, i) => ({
  _id: `sample-${i + 1}`,
  title: s.title,
  dek: s.dek,
  slug: s.slug,
  category: s.category,
  readMinutes: s.readMinutes,
  sectionHero: Boolean(s.sectionHero),
  imageUrl: `https://picsum.photos/seed/${s.slug}/1200/800`,
  imageAlt: s.title,
  body: s.body ?? [],
}));

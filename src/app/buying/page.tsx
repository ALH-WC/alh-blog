import type { Metadata } from 'next';
import { ServiceShell } from '../../components/service/ServiceShell';
import { ContactBand, GuideBand, ServiceTiles, StatsBand } from '../../components/service/bands';
import { Editorial, FaqBand, ReviewTrio, RowTable, StepGrid } from '../../components/service/studyBands';
import { SERVICES } from '../../lib/buying';
import styles from '../renting/renting.module.css';

// Rebuilt per the brief and copy doc on ALH-P2-0025/0026: calm expert voice,
// an editorial why-a-buying-agent argument, a 2x3 numbered process grid, and
// a factual costs table. Visually distinct from /renting, /letting, and /b2b.
export const metadata: Metadata = {
  title: 'Buying Agent Amsterdam for Expats | Amsterdam Life Homes',
  description:
    'Buying a home in Amsterdam as an expat? We search, value, and bid for you, and guide you through the contract and notary in plain English.',
  // The Framer page stays canonical until the domain cutover.
  robots: { index: false, follow: true },
};

// Confirmed answers only; the bridging and lost-bid answers join after
// Wassily confirms them on ALH-P2-0028.
const FAQS = [
  { q: 'Can I buy a home in the Netherlands as a foreigner?', a: 'Yes. There are no nationality restrictions on buying Dutch property. Financing is where your situation matters, and we help you navigate that.' },
  { q: 'How much can I borrow as an expat?', a: 'Dutch lenders generally finance up to 100% of the appraised value of the home; the rest, including the buyer costs, comes from your own means. An independent mortgage advisor confirms your exact number; we can introduce you to advisors who work with expats.' },
  { q: 'What is "kosten koper"?', a: 'The buyer costs on top of the purchase price: transfer tax (2% for owner-occupants), notary, valuation, and advice fees. We walk you through the exact numbers for your situation before you bid.' },
  { q: 'Do I really need to overbid?', a: 'Often, but not always, and never blindly. We assess what a home is actually worth and build a bid strategy around value, conditions, and timing, not panic.' },
  { q: 'How long does buying take?', a: 'From first viewing to keys is typically a few months, driven by the search and the notary timeline. We keep every step moving and you always know what comes next.' },
  { q: 'What does a buying agent cost?', a: 'We discuss our fee openly in the free intake call, before you commit to anything. No surprises.' },
];

const FAQ_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQS.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
};

export default function BuyingPage() {
  return (
    <ServiceShell current="/buying">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_SCHEMA) }} />

      {/* HERO (system hero layout; copy doc headline, 8 years aligned) */}
      <div className={styles.hero}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/buying/hero.webp" alt="A warm Amsterdam apartment living room" />
        <div className={styles.heroIn}>
          <h1>Buying a home in Amsterdam?<br />We bid smarter.</h1>
          <p>We are foreigners ourselves and have helped expats<br />find their homes here for over eight years.<br />We know the ins and outs and guide you every step.</p>
        </div>
      </div>

      <StatsBand />

      <Editorial
        eyebrow="Why a buying agent"
        big={<>Every bid you make competes with someone who has local knowledge. We make that someone yours.</>}
        cols={[
          'Amsterdam’s market moves fast, top properties go in days, and the winning bid is rarely just the highest number. Conditions, timing, and knowing what a street is really worth decide more than money.',
          'A buying agent levels the field: we find homes before you would, tell you honestly what a place is worth, and build a bid strategy that fits your budget instead of your fear of missing out. You stay in control of every decision; we make sure it is an informed one.',
        ]}
      />

      {/* WHAT YOU GET (live copy verbatim) */}
      <div className={styles.shead}>
        <span className={styles.eyebrow}>What you get</span>
        <h2 className={`${styles.secT} ${styles.hl}`}>A partner, not a portal</h2>
      </div>
      <div className={`${styles.cells} ${styles.c3}`} style={{ borderTop: '1px solid var(--hairline)' }}>
        {SERVICES.map((it) => (
          <div className={styles.cell} key={it.t}>
            <h3 className={styles.abroadH}>{it.t}</h3>
            <p className={styles.abroadP}>{it.b}</p>
          </div>
        ))}
      </div>

      <StepGrid
        eyebrow="The buying process"
        title="Six steps from intake to keys"
        steps={[
          { t: 'Intake call', b: 'Free, thirty minutes: your budget, wishes, and honest advice on what is realistic.' },
          { t: 'Search and viewings', b: 'We monitor the market daily and view with you, or for you with a video tour.' },
          { t: 'Value and strategy', b: 'We assess what the home is actually worth and design your bid: price, conditions, timing.' },
          { t: 'The bid', b: 'We negotiate for you. If it is not worth it, we tell you to walk away.' },
          { t: 'Contract and notary', b: 'We review the purchase contract, arrange the valuation, and guide you through the notary process in plain English.' },
          { t: 'Keys and beyond', b: 'Transfer inspection, key handover, and help with everything that comes after.' },
        ]}
      />

      <RowTable
        eyebrow="Costs explained"
        title="What buying actually costs"
        rows={[
          ['Transfer tax', '2% of the purchase price for owner-occupants'],
          ['Notary', 'Contract and deed handling, typically a fixed quote'],
          ['Valuation', 'Required for your mortgage'],
          ['Mortgage advice', 'Fee depends on your advisor'],
          ['Our fee', 'Discussed openly in the intake call, no surprises'],
        ]}
        note={'Together these are the "kosten koper" you see in listings. We walk you through the exact numbers for your situation before you commit to anything.'}
      />

      <ReviewTrio indices={[3, 4, 5]} />

      <FaqBand faqs={FAQS} />

      <ServiceTiles
        tiles={[
          ['/renting/hero-canal.jpg', 'Canal houses in Amsterdam', 'Looking for a rental home?', '/renting'],
          ['/renting/tile-letting.jpg', 'Bicycles on a canal bridge', 'Looking to let your property?', '/letting'],
          ['/renting/tile-corporate.jpg', 'A leafy Amsterdam lane', 'Relocating employees to Amsterdam?', '/b2b'],
        ]}
      />

      <GuideBand />

      <ContactBand
        defaultInterest="Buying"
        title={<>Thinking<br />about buying?</>}
        intro="Book a free call. We will tell you honestly whether buying makes sense for your situation, and what your budget gets you in this market. Fill in the form and we will get back to you within 24 hours."
        submitLabel="Book a call about buying"
      />
    </ServiceShell>
  );
}

import type { Metadata } from 'next';
import { ServiceShell } from '../../components/service/ServiceShell';
import { GuideBand, HeroStats, ServiceTiles } from '../../components/service/bands';
import {
  CompareBand, FaqBand, HSteps, LogoBar, PillarBand, QuoteFormBand, ReviewTrio, RowTable,
} from '../../components/service/studyBands';
import styles from '../renting/renting.module.css';
import { shareMeta } from '../../lib/og';

// Rebuilt per the approved content brief on ALH-P2-0039 and the copy doc on
// ALH-P2-0040: visually distinct from /renting (comparison table, pillars,
// horizontal timeline, pricing table, dark corporate-quote band).
export const metadata: Metadata = {
  ...shareMeta('b2b'),
  title: 'Corporate Housing for Expat Employees | Amsterdam Life Homes',
  description:
    'We house your expat employees in Amsterdam. One point of contact, 3.5 weeks average placement, invoiced to the company. Request a corporate quote.',
  // The Framer page stays canonical until the domain cutover.
  robots: { index: false, follow: true },
};

// Confirmed answers only; the two open ones (temporary housing, RMCs) join
// after Wassily confirms them on ALH-P2-0042.
const FAQS = [
  { q: 'What does Amsterdam Life Homes offer companies?', a: 'A full housing service for your relocating employees: the search, viewings, negotiation, contract review, and move-in onboarding. HR gets one dedicated contact and a confirmation when each employee is settled.' },
  { q: 'Can you handle multiple employees at once?', a: 'Yes. We regularly run parallel searches for teams. Each employee gets a personal brief and their own search; you keep a single point of contact for all of them.' },
  { q: 'What is the typical timeline?', a: 'The search starts within 24 hours of an employee brief. From kickoff to a signed contract takes 3.5 weeks on average.' },
  { q: 'How does pricing work for corporate clients?', a: 'One month’s rent plus 21% VAT per placement, invoiced to the company on 14-day terms. If we do not place your employee, you pay no fee. For 3 or more placements per year we make volume arrangements.' },
  { q: 'Do employees get help with contracts?', a: 'Yes, contract review is part of every placement. We flag issues, explain Dutch rental law in plain language, and negotiate terms before anyone signs.' },
  { q: 'Is there a dedicated account manager?', a: 'Yes. Every company works with one dedicated contact with same-day responses. No handoffs, no ticket queues.' },
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

export default function B2bPage() {
  return (
    <ServiceShell current="/b2b">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_SCHEMA) }} />

      {/* HERO (system hero layout; approved headline) */}
      <div className={styles.hero}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/b2b/hero.jpg" alt="A team at work in a bright office" />
        <div className={styles.heroIn}>
          <h1>Housing your expat employees<br />in Amsterdam.<br />Sorted.</h1>
          <p>We search, view, negotiate, and settle your people<br />into their new homes. One point of contact,<br />3.5 weeks on average, zero time from your HR team.</p>
        </div>
        <HeroStats stats={[['250+', 'Employees housed'], ['3.5 wks', 'Average placement'], ['8+ yrs', 'In the market'], ['1', 'Point of contact']]} />
      </div>

      <LogoBar label="Trusted by teams at" names={['Atlassian', 'Booking.com', 'Unilever', 'Adyen', 'TomTom']} />

      <CompareBand
        title="What a placement costs your team"
        without={[
          'Your employee spends their first weeks refreshing listing sites instead of settling in.',
          'HR chases agents, viewings, and paperwork across time zones.',
          'No escalation path when a deal falls through.',
          'Two to three months of back-and-forth per placement.',
        ]}
        withUs={[
          'One dedicated contact runs the entire search, end to end.',
          'Your employee only shows up to curated viewings, or watches our video tours.',
          'Contracts are reviewed and negotiated before anyone signs.',
          '3.5 weeks average from kickoff to keys.',
        ]}
      />

      <PillarBand
        eyebrow="What we offer"
        title={<>Everything between &ldquo;they signed&rdquo;<br />and &ldquo;they are settled&rdquo;</>}
        items={[
          { t: 'Full housing search', b: 'Daily monitoring, viewings, negotiations, and paperwork for every employee, at every budget level.' },
          { t: 'Contract review', b: 'We flag issues, explain Dutch rental law in plain language, and make sure your employee signs with confidence.' },
          { t: 'Move-in onboarding', b: 'Utilities, internet, TV, insurances, and a phone plan, set up before day one at the office.' },
          { t: 'One dedicated contact', b: 'Same-day responses, no handoffs, one thread for HR from intake to move-in.' },
        ]}
      />

      <HSteps
        eyebrow="The process"
        title="From intake to settled, in four steps"
        steps={[
          { t: 'Corporate intake call', b: 'Free, thirty minutes. We align on your setup, volumes, and timelines.' },
          { t: 'Employee brief and kickoff', b: 'We brief each employee personally. The search starts within 24 hours.' },
          { t: 'Search, viewings, sign', b: 'Daily search, guided viewings or video tours, negotiation, contract review. 3.5 weeks on average.' },
          { t: 'Settled and productive', b: 'Move-in inspection and full onboarding, with a confirmation to HR when it is done.' },
        ]}
      />

      {/* TRUST BAND */}
      <div className={styles.tagband}>
        <h2>Boutique service.<br />Enterprise reliability.</h2>
        <p>We are a small team by design, expats ourselves, with eight years in this market.<br />{' '}Your employees get a person, not a portal.</p>
      </div>

      <RowTable
        eyebrow="Pricing"
        title="One fee per placement. Nothing hidden."
        rows={[
          ['Per placement', 'One month’s rent + 21% VAT'],
          ['Invoicing', 'To the company, 14-day payment terms'],
          ['Included', 'Search, viewings, negotiation, contract review, move-in onboarding'],
          ['No placement', 'No fee'],
          ['3+ placements per year', 'Volume arrangements, discussed in the intake'],
        ]}
      />

      <ReviewTrio indices={[0, 1, 2]} />

      <FaqBand faqs={FAQS} />

      <QuoteFormBand />

      <ServiceTiles
        tiles={[
          ['/renting/hero-canal.jpg', 'Canal houses in Amsterdam', 'Looking for a rental home?', '/renting'],
          ['/buying/hero.webp', 'A warm Amsterdam apartment living room', 'Thinking about buying instead?', '/buying'],
          ['/renting/tile-letting.jpg', 'Bicycles on a canal bridge', 'Looking to let your property?', '/letting'],
        ]}
      />

      <GuideBand />
    </ServiceShell>
  );
}

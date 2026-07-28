import type { Metadata } from 'next';
import Link from 'next/link';
import { ServiceShell } from '../../components/service/ServiceShell';
import { ContactBand, GuideBand, HeroStats, ServiceTiles } from '../../components/service/bands';
import { AltRows, ChecklistBand, FaqBand, VSteps } from '../../components/service/studyBands';
import { CHALLENGES, SERVICES } from '../../lib/letting';
import styles from '../renting/renting.module.css';
import { shareMeta } from '../../lib/og';

// Rebuilt per the brief and copy doc on ALH-P2-0032/0033: landlord voice,
// alternating service rows, the tenant-screening checklist as centerpiece,
// a vertical process rail, and transparent fee framing. Visually distinct
// from /renting and /b2b.
export const metadata: Metadata = {
  ...shareMeta('letting'),
  title: 'Letting Agent Amsterdam | Amsterdam Life Homes',
  description:
    'We let and manage your Amsterdam property: listings, viewings, full tenant screening, and the contract. One clear fee, quoted before anything starts.',
  // The Framer page stays canonical until the domain cutover.
  robots: { index: false, follow: true },
};

// Confirmed answers only; fee wording, the lawyer line, the letting-from-abroad
// setup, and the deposit flow stay off the page until confirmed on ALH-P2-0035.
const FAQS = [
  { q: 'How do you screen tenants?', a: 'We verify income and employment with documents, collect references from previous landlords, review rental history, and speak with every serious applicant personally. You approve the final candidate.' },
  { q: 'How long does it take to find a tenant?', a: 'Our average match takes 3.5 weeks. A realistic asking rent and good presentation, which we handle, are the biggest factors.' },
  { q: 'Do you also manage the property after move-in?', a: 'Yes, optionally. Full-service management means we handle the logistics and keep your property in top condition, for you and your tenants.' },
  { q: 'What about Dutch rental law?', a: 'We guide you through the legal landscape and make sure your contract and tenancy setup are in order before anyone signs.' },
  { q: 'Furnished or unfurnished, what should I offer?', a: 'It depends on your property and target tenants. We advise you in the consultation on what rents best in your neighborhood and at what price.' },
  { q: 'What does it cost to let my property through you?', a: 'Every property is different, so we quote one clear fee in the free consultation, before anything starts. It covers the listing, viewings, tenant screening, and the contract.' },
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

export default function LettingPage() {
  return (
    <ServiceShell current="/letting">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_SCHEMA) }} />

      {/* HERO (system hero layout; copy doc headline) */}
      <div className={styles.hero}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/letting/hero.webp" alt="One of our founders on a canal bridge in Amsterdam" />
        <div className={styles.heroIn}>
          <h1>Your property in good hands.<br />And rented out.</h1>
          <p>We find the tenants, run the screening,<br />and manage your home like it is our own.<br />You collect the rent, we handle the rest.</p>
        </div>
        <HeroStats stats={[['8+ yrs', 'In the market'], ['250+', 'Placements made'], ['3.5 wks', 'Average to match'], ['85%', 'From referrals']]} />
      </div>

      <AltRows
        eyebrow="What we do for landlords"
        title={<>Everything between &ldquo;I want to let it&rdquo;<br />and &ldquo;it is let&rdquo;</>}
        rows={[
          { t: 'Finding tenants', b: CHALLENGES[0].b },
          { t: 'Creating listings', b: SERVICES[0].b },
          { t: 'Tenant screening', b: SERVICES[1].b },
          { t: 'Property management', b: SERVICES[2].b },
        ]}
      />

      <ChecklistBand
        eyebrow="Tenant screening"
        title={<>Who we let<br />into your home</>}
        intro="Choosing the right tenants makes all the difference. Before anyone signs, we verify:"
        items={[
          'Income and employment, with documents, not promises',
          'References from previous landlords',
          'Complete rental history and background',
          'A personal conversation. We rent to people we would rent to ourselves.',
        ]}
        closing="Our vetting process ensures your property is in good hands."
      />

      <VSteps
        eyebrow="The letting process"
        title="Five steps, one contact"
        steps={[
          { t: 'Consultation call', b: 'Free and thirty minutes. We discuss your property, expected rent, and what kind of tenancy you want.' },
          { t: 'Listing and marketing', b: 'Professional photos and an engaging description, advertised on all important channels.' },
          { t: 'Viewings and screening', b: 'We host the viewings and fully screen every serious applicant.' },
          { t: 'Contract and check-in', b: 'A solid rental contract, deposit handling, and a documented check-in inspection.' },
          { t: 'Ongoing management', note: '(optional)', b: 'Full-service management: logistics handled, property kept in top condition.' },
        ]}
      />

      {/* FEES */}
      <div className={styles.tagband}>
        <h2>One clear fee.<br />No surprises.</h2>
        <p>Every property is different, so we quote your fee in the consultation, before anything starts.<br />{' '}It covers the listing, viewings, screening, and contract.</p>
      </div>

      {/* LANDLORD VOICES (bridge until real landlord testimonials exist) */}
      <div className={styles.shead}>
        <span className={styles.eyebrow}>Both sides of the contract</span>
        <h2 className={`${styles.secT} ${styles.hl}`}>We treat your tenants well. It shows.</h2>
        <p>Happy tenants stay longer, pay on time, and take care of your home.<br />Read what the tenants we place say about how we work.</p>
      </div>
      <div style={{ padding: '0 var(--gutter) 56px' }}>
        <Link className={styles.tlink} href="/reviews">Read all our reviews <span className={styles.ar}>&rarr;</span></Link>
      </div>

      <FaqBand faqs={FAQS} />

      <ServiceTiles
        tiles={[
          ['/renting/hero-canal.jpg', 'Canal houses in Amsterdam', 'Looking for a rental home?', '/renting'],
          ['/buying/hero.webp', 'A warm Amsterdam apartment living room', 'Thinking about buying instead?', '/buying'],
          ['/renting/tile-corporate.jpg', 'A leafy Amsterdam lane', 'Relocating employees to Amsterdam?', '/b2b'],
        ]}
      />

      <GuideBand />

      <ContactBand
        defaultInterest="Letting"
        title={<>Let&apos;s talk<br />about your property</>}
        intro="A free consultation call: your property, realistic rent, and how we would let it. No obligation. Fill in the form and we will get back to you within 24 hours."
        submitLabel="Book a free landlord consultation"
      />
    </ServiceShell>
  );
}

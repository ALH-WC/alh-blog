import type { Metadata } from 'next';
import { ServiceShell } from '../../components/service/ServiceShell';
import { ContactBand, GuideBand } from '../../components/service/bands';
import { INTAKE_URL } from '../../lib/renting';
import styles from '../renting/renting.module.css';
import { shareMeta } from '../../lib/og';

// Rebuild of /contact per ALH-CRO-0210 (Ground Zero Report, Section Five,
// finding v): a real H1, short supporting copy, and ContactPage schema.
export const metadata: Metadata = {
  ...shareMeta('contact'),
  title: 'Contact Amsterdam Life Homes',
  description:
    'Contact Amsterdam Life Homes. Tell us your budget, desired move date, and neighbourhoods, and we reply within 24 hours. Or book a free video intake call.',
  // The Framer page stays canonical until the domain cutover.
  robots: { index: false, follow: true },
};

const SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'ContactPage',
  name: 'Contact Amsterdam Life Homes',
  url: 'https://amsterdamlifehomes.com/contact',
  mainEntity: {
    '@type': 'RealEstateAgent',
    name: 'Amsterdam Life Homes',
    email: 'home@amsterdamlifehomes.com',
    telephone: '+31 6 1374 9944',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Amsterdam',
      addressCountry: 'NL',
    },
    openingHours: 'Mo-Fr 09:00-17:00',
  },
};

export default function ContactPage() {
  return (
    <ServiceShell current="/contact" heroless>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA) }} />

      <div className={styles.shead} style={{ paddingTop: 150 }}>
        <span className={styles.eyebrow}>Contact</span>
        <h1 className={styles.pageTitle}>Contact Amsterdam Life Homes</h1>
        <p style={{ marginTop: 22 }}>
          The fastest route is the form below. Tell us your budget, your desired move date, and the neighbourhoods
          you have in mind, and we will get back to you within 24 hours.
        </p>
        <p style={{ marginTop: 12 }}>
          Prefer to talk first? Schedule a free video intake call: thirty minutes, no obligation, and you will know
          exactly how we can help.
        </p>
        <a className={styles.tlink} href={INTAKE_URL} target="_blank" rel="noreferrer" style={{ marginTop: 22 }}>
          Schedule a free video intake call <span className={styles.ar}>&rarr;</span>
        </a>
      </div>

      <ContactBand defaultInterest="Renting" />
      <GuideBand />
    </ServiceShell>
  );
}

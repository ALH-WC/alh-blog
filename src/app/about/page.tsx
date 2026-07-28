import type { Metadata } from 'next';
import { ServiceShell } from '../../components/service/ServiceShell';
import { StatsBand, GuideBand, ServiceTiles } from '../../components/service/bands';
import { INTAKE_URL, THIS_IS_US_TXT } from '../../lib/renting';
import styles from '../renting/renting.module.css';
import { shareMeta } from '../../lib/og';

// The About page: the full version of the "This is us" bands on the service
// pages. Copy is the live site's about section verbatim, plus our shared
// story text. E-E-A-T anchor for the whole domain.
export const metadata: Metadata = {
  ...shareMeta('about'),
  title: 'About Us | Amsterdam Life Homes',
  description:
    'Amsterdam Life Homes is a boutique housing agency run by local expats. Eight years and 250+ successful searches in Amsterdam, with every client working with us personally.',
  // The Framer site stays canonical until the domain cutover.
  robots: { index: false, follow: true },
};

const SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  name: 'About Amsterdam Life Homes',
  url: 'https://amsterdamlifehomes.com/about',
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
  },
};

export default function AboutPage() {
  return (
    <ServiceShell current="/about" heroless>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA) }} />

      <div className={styles.shead} style={{ paddingTop: 150 }}>
        <span className={styles.eyebrow}>About us</span>
        <h1 className={styles.pageTitle}>Amsterdam&apos;s boutique housing agency,<br />run by local expats.</h1>
        <p style={{ marginTop: 22 }}>
          We have been in your shoes, know what you are looking for,<br />
          and simply treat you the way we want to be treated.
        </p>
        <a className={styles.tlink} href={INTAKE_URL} target="_blank" rel="noreferrer" style={{ marginTop: 22 }}>
          Schedule a free video intake call <span className={styles.ar}>&rarr;</span>
        </a>
      </div>

      <StatsBand />

      {/* FOREIGNERS OURSELVES (live about section, verbatim) */}
      <div className={`${styles.cells} ${styles.c2} ${styles.thisus}`}>
        <div className={styles.cell} style={{ padding: '76px 56px' }}>
          <span className={styles.eyebrow} style={{ marginBottom: 20 }}>Foreigners ourselves</span>
          <h2 className={`${styles.secT} ${styles.hl}`}>New country, new language,<br />new everything.</h2>
          <p style={{ marginTop: 20, fontSize: 16, maxWidth: '60ch' }}>
            We get it. It is a lot, and we have been there. We are foreigners ourselves, and together with our team
            we call Amsterdam home. We speak your language and believe clear communication, trust, and proper
            expectation management are crucial for a great house hunt experience.
          </p>
          <p style={{ marginTop: 14, fontSize: 16, maxWidth: '60ch' }}>
            With over 8 years of experience, we understand the challenges of moving to a new country. We help you
            navigate not just the housing market, but also Dutch customs and rules. We go the extra mile to ensure
            a smooth, stress-free experience.
          </p>
        </div>
        <div className={styles.cell} style={{ padding: '76px 56px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <p className={styles.thisusQuote}>We speak your language,<br />in every sense.</p>
        </div>
      </div>

      {/* OUR STORY */}
      <div className={`${styles.cells} ${styles.c2} ${styles.thisus}`}>
        <div className={styles.cell} style={{ padding: '76px 56px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <p className={styles.thisusQuote}>Eight years and 250+ successful searches later, every client still works with us personally.</p>
        </div>
        <div className={styles.cell} style={{ padding: '76px 56px' }}>
          <span className={styles.eyebrow} style={{ marginBottom: 20 }}>Our story</span>
          <h2 className={`${styles.secT} ${styles.hl}`}>We have been in your shoes.<br />That is why we do this.</h2>
          <p style={{ marginTop: 20, fontSize: 16, maxWidth: '60ch' }}>{THIS_IS_US_TXT}</p>
        </div>
      </div>

      {/* WHAT WE DO */}
      <ServiceTiles
        tiles={[
          ['/renting/hero-canal.jpg', 'Canal houses in Amsterdam', 'Looking for a rental home?', '/renting'],
          ['/renting/tile-letting.jpg', 'Bicycles on a canal bridge', 'Looking to let your property?', '/letting'],
          ['/renting/tile-corporate.jpg', 'A leafy Amsterdam lane', 'Relocating employees to Amsterdam?', '/b2b'],
        ]}
      />

      <GuideBand />
    </ServiceShell>
  );
}

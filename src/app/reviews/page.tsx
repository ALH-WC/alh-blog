import type { Metadata } from 'next';
import { ServiceShell } from '../../components/service/ServiceShell';
import { GuideBand } from '../../components/service/bands';
import { REVIEWS } from '../../lib/renting';
import styles from '../renting/renting.module.css';
import { shareMeta } from '../../lib/og';

// The full review wall. Every service page shows a carousel excerpt and links
// here; this page links onward to Google, which is where the stars that show
// up in search results actually live (self-serving review schema is ignored,
// so we ship none).
export const metadata: Metadata = {
  ...shareMeta('reviews'),
  title: 'Client Reviews | Amsterdam Life Homes',
  description:
    'What our clients say about finding their Amsterdam home with us. 85% of our business comes from referrals.',
  // The Framer site stays canonical until the domain cutover.
  robots: { index: false, follow: true },
};

const GOOGLE_REVIEWS_URL = 'https://www.google.com/search?q=Amsterdam+Life+Homes+Reviews';

export default function ReviewsPage() {
  return (
    <ServiceShell current="/reviews" heroless ctaTitle="Let's talk." formHref="/contact#contact">
      <div className={styles.shead} style={{ paddingTop: 150 }}>
        <span className={styles.eyebrow}>Google reviews</span>
        <h1 className={styles.pageTitle}>Don&apos;t just take our word for it</h1>
        <p style={{ marginTop: 22 }}>
          We believe that the true measure of our success lies in the satisfaction of our clients.
          <br />
          85% of our business comes from referrals.
        </p>
        <a className={styles.tlink} href={GOOGLE_REVIEWS_URL} target="_blank" rel="noreferrer" style={{ marginTop: 22 }}>
          Check our Google Reviews <span className={styles.ar}>&#8599;</span>
        </a>
      </div>

      <div className={styles.rgrid}>
        {REVIEWS.map((r) => (
          <div className={styles.rev} key={`${r.who}-${r.date}`}>
            <q>{r.quote}</q>
            <p>{r.body}</p>
            <div className={styles.who}><b>{r.who}</b><span>{r.date}</span></div>
          </div>
        ))}
      </div>

      <GuideBand />
    </ServiceShell>
  );
}

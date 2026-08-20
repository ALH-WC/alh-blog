import type { Metadata } from 'next';
import Link from 'next/link';
import { ServiceShell } from '../components/service/ServiceShell';
import { GuideBand, HeroStats } from '../components/service/bands';
import { INTAKE_URL, REVIEWS } from '../lib/renting';
import styles from './renting/renting.module.css';
import { shareMeta } from '../lib/og';

// The homepage, rebuilt one-to-one to the approved page mockup
// "ALH Homepage 2c" (the Quiet System): about split with a full-bleed
// team photo, four numbered service tiles (fourth on sand), a captioned
// photo band, the reviews intro row + three cells (middle on sand), the
// employers row, and the left-aligned closing invitation with two text
// CTAs. No form, no stats band (stats live in the hero pile), no filled
// buttons below the hero.
export const metadata: Metadata = {
  ...shareMeta('home'),
  title: 'Expat Housing Amsterdam | Amsterdam Life Homes',
  description:
    'Fellow expats helping you rent, buy, or let your Amsterdam home. We have been in your shoes and treat every client like we would want to be treated.',
  // The Framer homepage stays canonical until the domain cutover.
  robots: { index: false, follow: true },
};

// Organization + WebSite JSON-LD per ALH-SEO task; RealEstateAgent carried
// over from the live page's schema. No AggregateRating: Google ignores
// self-serving review markup, the stars live on the Google Business Profile.
const SCHEMA = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://amsterdamlifehomes.com/#org',
      name: 'Amsterdam Life Homes',
      url: 'https://amsterdamlifehomes.com',
      email: 'home@amsterdamlifehomes.com',
      telephone: '+31 6 1374 9944',
      address: { '@type': 'PostalAddress', addressLocality: 'Amsterdam', addressCountry: 'NL' },
      sameAs: [
        'https://www.instagram.com/amsterdamlifehomes/',
        'https://www.linkedin.com/company/amsterdamlifehomes',
        'https://www.youtube.com/@AmsterdamLifeHomes',
        'https://www.tiktok.com/@amsterdamlife.homes',
      ],
    },
    {
      '@type': 'WebSite',
      '@id': 'https://amsterdamlifehomes.com/#website',
      url: 'https://amsterdamlifehomes.com',
      name: 'Amsterdam Life Homes',
      publisher: { '@id': 'https://amsterdamlifehomes.com/#org' },
    },
    {
      '@type': 'RealEstateAgent',
      '@id': 'https://amsterdamlifehomes.com/#agent',
      name: 'Amsterdam Life Homes',
      url: 'https://amsterdamlifehomes.com',
      email: 'home@amsterdamlifehomes.com',
      telephone: '+31 6 1374 9944',
      areaServed: 'Amsterdam',
      address: { '@type': 'PostalAddress', addressLocality: 'Amsterdam', addressCountry: 'NL' },
      parentOrganization: { '@id': 'https://amsterdamlifehomes.com/#org' },
    },
  ],
};

// The mockup's four tiles: name, one-line promise, destination.
const TILES: [string, string, string, string][] = [
  ['01', 'Renting in Amsterdam', 'Properties go within hours. We get ahead of the market for you, whether you are still abroad or already here.', '/renting'],
  ['02', 'Letting your property', 'We match the right tenant to the right property from the start, and protect your investment while they live there.', '/letting'],
  ['03', 'Buying in Amsterdam', 'Buying as an expat is complex. We represent only you, never the seller, and we guide you through every step.', '/buying'],
  ['04', 'Relocating employees', 'We handle expat housing at scale for companies and relocation managers, with the same personal approach.', '/b2b'],
];

// The three lead reviews named in the approved copy doc. Context labels
// stay the placeholder keyword line until real per-client data arrives.
const LEAD_REVIEWS = ['Melissa', 'Elora', 'Sally'];

export default function HomePage() {
  const leads = LEAD_REVIEWS
    .map((n) => REVIEWS.find((r) => r.who.includes(n)))
    .filter((r): r is (typeof REVIEWS)[number] => Boolean(r));

  return (
    <ServiceShell current="/" ctaTitle="Let's talk." formHref="/contact#contact">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA) }} />

      {/* HERO (approved, untouched): brand video, H1 bottom-left, stats pile */}
      <div className={styles.hero}>
        <video autoPlay muted loop playsInline poster="/home/hero.webp" aria-hidden="true">
          <source src="/home/hero.mp4" type="video/mp4" />
        </video>
        {/* One CTA only (round 2); the home pile carries three stats */}
        <div className={styles.heroIn}>
          <h1>We help fellow expats<br />rent, let, and buy their home<br />in Amsterdam</h1>
          <div className={styles.heroBtns}>
            <a className={styles.heroBtn} href={INTAKE_URL} target="_blank" rel="noreferrer">Schedule a free video call</a>
          </div>
        </div>
        <HeroStats stats={[['250+', 'Expats housed'], ['9+ yrs', 'Of experience'], ['85%', 'From referrals']]} />
      </div>

      {/* THE BOUTIQUE STATEMENT: the breath between hero and photo (round 2) */}
      <div className={styles.qIntro} style={{ paddingTop: 100, paddingBottom: 100 }}>
        <h2 className={`${styles.qT} ${styles.qTBig} ${styles.qStmtT}`}>Amsterdam&apos;s boutique housing agency,<br />run by local expats.</h2>
        <p className={styles.qDek} style={{ maxWidth: 'none', fontSize: 17 }}>We have been in your shoes, know what you are looking for,<br />and simply treat you the way we want to be treated.</p>
      </div>

      {/* ABOUT SPLIT: text left, full-bleed team photo right */}
      <div className={styles.qSplit}>
        <div className={styles.qSplitTxt}>
          <span className={styles.eyebrow}>About us</span>
          <h2 className={styles.qSplitTitle}>Foreigners ourselves.</h2>
          <p>We get it. New country, new rules, new everything. When we moved to Amsterdam, finding a home felt like a full time job we were not qualified for. Nine years on, we have helped over 250 people through the same process. Not because we learned it from a textbook, but because we lived it.</p>
          <p>We are a boutique agency and that is intentional. Every client works directly with us. We know Amsterdam&apos;s neighbourhoods, its landlords, its contracts, and the unwritten rules that make all the difference. We handle everything so you can focus on the move itself.</p>
          <Link className={`${styles.qLink} ${styles.qLinkSm}`} href="/about" style={{ marginTop: 18 }}>More about us <span className={styles.ar}>&rarr;</span></Link>
        </div>
        <div className={styles.qPhoto}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/home/about.webp" alt="The Amsterdam Life Homes founders on a bench in Amsterdam" />
        </div>
      </div>

      {/* SERVICES: four numbered tiles, all white, sand on hover (round 2) */}
      <div className={styles.qTiles}>
        {TILES.map(([n, name, promise, href]) => (
          <Link key={n} href={href} className={styles.qTile}>
            <span className={styles.qNum}>{n}</span>
            <span className={styles.qTileBtm}>
              <span className={styles.qTileName}>{name}</span>
              <span className={styles.qTileP}>{promise}</span>
              <span className={styles.qTileGo}>Learn more <span className={styles.ar}>&rarr;</span></span>
            </span>
          </Link>
        ))}
      </div>

      {/* PHOTO BAND: three captioned full-bleed photos (verified captions only) */}
      <div className={styles.qBand} style={{ gridTemplateColumns: '1.2fr 1fr 1.4fr' }}>
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/renting/tile-corporate.jpg" alt="A leafy Amsterdam lane" />
          <div className={styles.qCap}>A leafy Amsterdam lane</div>
        </div>
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/renting/tile-letting.jpg" alt="Bicycles on a canal bridge" />
          <div className={styles.qCap}>Bicycles on a canal bridge</div>
        </div>
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/renting/hero-canal.jpg" alt="Canal houses in daylight" />
          <div className={styles.qCap}>Canal houses in daylight</div>
        </div>
      </div>

      {/* REVIEWS: intro row + three cells, middle on sand */}
      <div className={styles.qIntroRow} id="reviews">
        <div className={styles.qIntroTxt}>
          <span className={styles.eyebrow}>What our clients say</span>
          <h2 className={styles.qT}>Do not just take our word for it</h2>
          <p className={styles.qDek}>The true measure of our work is what our clients say afterwards.<br />85% of our business comes from referrals.</p>
        </div>
        <Link className={`${styles.qLink} ${styles.qLinkSm}`} href="/reviews">Read all our reviews <span className={styles.ar}>&rarr;</span></Link>
      </div>
      <div className={styles.rgrid} style={{ borderTop: '1px solid #EAE7E1', borderBottom: '1px solid #EAE7E1' }}>
        {leads.map((r) => (
          <div className={styles.rev} key={r.who} style={{ border: 0, borderRight: '1px solid #EAE7E1' }}>
            <q>{r.quote}</q>
            <p>{r.body}</p>
            <div className={styles.rtags}>{r.tags.map((t) => <span key={t}>{t}</span>)}</div>
            <div className={styles.who}><b>{r.who}</b></div>
          </div>
        ))}
      </div>

      {/* EMPLOYERS: rotating wordmark marquee (round 2) */}
      <div className={styles.qEmployers}>
        <span className={styles.eyebrow}>Our clients work at companies like</span>
        <div className={styles.marq}>
          <div className={styles.mtrack}>
            {[0, 1].map((half) => (
              <div className={styles.qMarqWords} key={half} aria-hidden={half === 1}>
                <span>Atlassian</span><span>Booking.com</span><span>Deliverect</span><span>Unilever</span><span>Bloomreach</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CLOSING INVITATION */}
      <div className={styles.qClose} style={{ borderTop: '1px solid #EAE7E1' }}>
        <span className={styles.eyebrow}>Ready to start?</span>
        <h2 className={styles.qCloseT}>It starts<br />with a video call</h2>
        <p>Book a free 30 minute video call with us. Whether you are searching for a home, letting your property, buying, or relocating a team: you tell us what you need, we tell you how everything works and what you can expect. No commitment, no sales pitch, just a conversation.</p>
        <div className={styles.qCloseRow}>
          <a className={styles.qLink} href={INTAKE_URL} target="_blank" rel="noreferrer">Schedule a free video call <span className={styles.ar}>&rarr;</span></a>
        </div>
        <div className={styles.qFine}>Free. Takes 30 minutes. And will give you all the clarity you were looking for.</div>
      </div>

      {/* The site-wide guide band: identical on every company page */}
      <GuideBand />
    </ServiceShell>
  );
}

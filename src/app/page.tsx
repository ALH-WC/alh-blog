import type { Metadata } from 'next';
import Link from 'next/link';
import { ServiceShell } from '../components/service/ServiceShell';
import { GuideBand, HeroStats } from '../components/service/bands';
import { LogoBar } from '../components/service/studyBands';
import { INTAKE_URL, REVIEWS } from '../lib/renting';
import styles from './renting/renting.module.css';

// The homepage, built to the approved structure on ALH-P2-0049 and the copy
// doc on ALH-P2-0050, rendered in the Warm Paper system: human story above
// services, trust bar after the human moment, empathetic service cards with
// a dark corporate strip, three lead reviews, and Cal.com as the only CTA
// (no form on the homepage; the form lives on /contact).
// Stats use the verified set (250+/3.5wks/8+yrs/85%), not the studies' 300+.
export const metadata: Metadata = {
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

// The three lead reviews named in the approved copy doc.
const LEAD_REVIEWS = ['Stephanie', 'Olejsa', 'Bene'];

export default function HomePage() {
  const leads = LEAD_REVIEWS
    .map((n) => REVIEWS.find((r) => r.who.includes(n)))
    .filter((r): r is (typeof REVIEWS)[number] => Boolean(r));

  return (
    <ServiceShell current="/">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA) }} />

      {/* 1. HERO (H1 verbatim per the competitor study: best headline in the market) */}
      <div className={styles.hero}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/home/hero.webp" alt="Sunlit Amsterdam canal houses" />
        <div className={styles.heroIn}>
          <h1>We help fellow expats rent, let,<br />and buy their home<br />in Amsterdam</h1>
          <p>Amsterdam&apos;s housing market does not slow down for anyone. Least of all for someone who just arrived, or who is still trying to get here. We know this because we have been in that exact position. We are expats ourselves, and we built ALH to be the people we wished we had when we moved here.</p>
          <div className={styles.heroBtns}>
            <a className={styles.heroBtn} href={INTAKE_URL} target="_blank" rel="noreferrer">Schedule a free video call</a>
            <a className={styles.heroScroll} href="#services">See how we work &darr;</a>
          </div>
        </div>
        <HeroStats />
      </div>

      {/* 2. THE HUMAN STORY (above services, per the approved structure) */}
      <div className={styles.homeAbout}>
        <div>
          <span className={styles.eyebrow}>About us</span>
          <h2 className={styles.homeAboutTitle}>Foreigners ourselves.</h2>
          <p>We get it. New country, new rules, new everything. When we moved to Amsterdam, finding a home felt like a full-time job we were not qualified for. Eight years on, we have helped over 250 people through the same process. Not because we learned it from a textbook, but because we lived it.</p>
          <p>We are a boutique agency and that is intentional. Every client works directly with us. We know Amsterdam&apos;s neighbourhoods, its landlords, its contracts, and the unwritten rules that make all the difference. We handle everything so you can focus on the move itself.</p>
          <Link className={styles.tlink} href="/about" style={{ marginTop: 24 }}>More about us <span className={styles.ar}>&rarr;</span></Link>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className={styles.homeAboutImg} src="/home/about.webp" alt="The Amsterdam Life Homes founders on a bench in Amsterdam" />
      </div>

      {/* 4. SERVICES */}
      <span id="services" />
      <div className={styles.shead}>
        <span className={styles.eyebrow}>What we do</span>
        <h2 className={`${styles.secT} ${styles.hl}`}>However you need help, we have done it before</h2>
      </div>
      <div className={styles.svcCards}>
        <div className={styles.svcCard}>
          <h3>Renting in Amsterdam</h3>
          <p>Amsterdam&apos;s rental market moves fast and it does not wait. Properties go within hours. We get ahead of it for you, whether you are still abroad or already here.</p>
          <div className={styles.svcList}>
            <div><span className={styles.m}>+</span>Personalised shortlist based on your actual needs</div>
            <div><span className={styles.m}>+</span>We attend every viewing with you, in person or by video call</div>
            <div><span className={styles.m}>+</span>Negotiation and contract review included</div>
            <div><span className={styles.m}>+</span>Works fully remotely if you have not moved yet</div>
          </div>
          <Link className={styles.tlink} href="/renting">Learn more about renting <span className={styles.ar}>&rarr;</span></Link>
        </div>
        <div className={styles.svcCard}>
          <h3>Letting your property</h3>
          <p>Your property deserves tenants who treat it like their own home. We find them, and we protect your investment by matching the right tenant to the right property from the start.</p>
          <div className={styles.svcList}>
            <div><span className={styles.m}>+</span>Access to our vetted expat tenant network</div>
            <div><span className={styles.m}>+</span>Full screening and background checks</div>
            <div><span className={styles.m}>+</span>Contract drafting and legal compliance</div>
            <div><span className={styles.m}>+</span>Optional full property management</div>
          </div>
          <Link className={styles.tlink} href="/letting">Learn more about letting <span className={styles.ar}>&rarr;</span></Link>
        </div>
        <div className={styles.svcCard}>
          <h3>Buying in Amsterdam</h3>
          <p>Buying a home in the Netherlands as an expat is genuinely complex. The process, the rules, the bidding culture. We make sure you understand every step before you take it.</p>
          <div className={styles.svcList}>
            <div><span className={styles.m}>+</span>Independent buying agent representing only you</div>
            <div><span className={styles.m}>+</span>Bid strategy and negotiation</div>
            <div><span className={styles.m}>+</span>Dutch legal and mortgage process explained clearly</div>
            <div><span className={styles.m}>+</span>Guided dozens of expats through the full process</div>
          </div>
          <Link className={styles.tlink} href="/buying">Learn more about buying <span className={styles.ar}>&rarr;</span></Link>
        </div>
      </div>
      <div className={styles.b2bStrip}>
        <div>
          <h3>Relocating employees to Amsterdam?</h3>
          <p>We partner with companies and relocation managers to handle expat housing at scale, with the same personal approach we bring to every client.</p>
        </div>
        <Link className={styles.b2bStripLink} href="/b2b">Learn about our corporate service <span className={styles.ar}>&rarr;</span></Link>
      </div>

      {/* 5. SOCIAL PROOF */}
      <div className={`${styles.shead} ${styles.sheadWide}`} id="reviews">
        <span className={styles.eyebrow}>What our clients say</span>
        <h2 className={`${styles.secT} ${styles.hl}`}>Don&apos;t just take our word for it</h2>
        <p>We believe that the true measure of our success lies in the satisfaction of our clients.<br />85% of our business comes from referrals.</p>
      </div>
      <div style={{ padding: '0 var(--gutter) 40px' }}>
        <Link className={styles.tlink} href="/reviews">Read all our reviews <span className={styles.ar}>&rarr;</span></Link>
      </div>
      <div className={styles.rgrid} style={{ borderBottom: '1px solid var(--hairline)' }}>
        {leads.map((r) => (
          <div className={styles.rev} key={r.who}>
            <q>{r.quote}</q>
            <p>{r.body}</p>
            <div className={styles.who}><b>{r.who}</b><span>{r.date}</span></div>
          </div>
        ))}
      </div>
      <LogoBar label="Our clients work at" names={['Atlassian', 'Booking.com', 'Deliverect', 'Unilever', 'Bloomreach']} />

      {/* 6. FINAL CTA (Cal.com only; the form lives on /contact) */}
      <div className={styles.finalCta}>
        <span className={styles.eyebrow}>Ready to start?</span>
        <h2 className={styles.finalCtaTitle}>Let&apos;s find your place<br />in Amsterdam.</h2>
        <p>Book a free 30-minute video call with us. We will ask a few questions to understand exactly where you are in the process and tell you honestly how we can help. No commitment. No sales pitch. Just a conversation.</p>
        <a className={styles.finalCtaBtn} href={INTAKE_URL} target="_blank" rel="noreferrer">Schedule a free video call</a>
        <div className={styles.finalCtaNote}>Free. Takes 30 minutes. We respond within 24 hours.</div>
      </div>

      <GuideBand />
    </ServiceShell>
  );
}

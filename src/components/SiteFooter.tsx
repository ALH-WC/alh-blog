import Link from 'next/link';
import styles from './SiteFooter.module.css';

const NAV = [
  { href: '/renting', label: 'Renting', internal: false },
  { href: '/buying', label: 'Buying', internal: false },
  { href: '/letting', label: 'Letting', internal: false },
  { href: '/b2b', label: 'B2B', internal: false },
  { href: '/#about-us', label: 'About us', internal: false },
  { href: '/#review', label: 'Reviews', internal: false },
  { href: '/blog', label: 'Our Amsterdam Guide', internal: true },
  { href: '/contact', label: 'Contact', internal: false },
];

// Light, warm footer, shared by the blog index and article pages. Signups are
// handled by the site-wide pop-up, so there is no newsletter form here.
export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.grid}>
          {/* Column 1: brand / contact */}
          <div className={styles.brand}>
            <Link href="/" className={styles.logo}>Amsterdam Life Homes</Link>
            <p className={styles.tagline}>
              We help fellow expats<br />rent, let, and buy their home<br />in Amsterdam
            </p>
            <ul className={styles.contact}>
              <li><a href="mailto:home@amsterdamlifehomes.com">home@amsterdamlifehomes.com</a></li>
              <li><a href="tel:+31613749944">+31 6 1374 9944</a></li>
            </ul>
            <p className={styles.hours}>Mon to Fri: 9 AM to 5 PM CEST</p>
            <div className={styles.social}>
              <a href="https://www.instagram.com/amsterdamlifehomes/" target="_blank" rel="noreferrer">Instagram</a>
              <a href="https://www.linkedin.com/company/amsterdamlifehomes" target="_blank" rel="noreferrer">LinkedIn</a>
              <a href="https://www.youtube.com/@AmsterdamLifeHomes" target="_blank" rel="noreferrer">YouTube</a>
              <a href="https://www.tiktok.com/@amsterdamlife.homes" target="_blank" rel="noreferrer">TikTok</a>
            </div>
          </div>

          {/* Column 2: nav links */}
          <nav className={styles.nav} aria-label="Footer">
            {NAV.map((l) =>
              l.internal ? (
                <Link key={l.label} href={l.href}>{l.label}</Link>
              ) : (
                <a key={l.label} href={l.href}>{l.label}</a>
              ),
            )}
          </nav>

          {/* Column 3: partners */}
          <div className={styles.partners}>
            <span>We are proud partners of:</span>
            <a
              href="https://www.pararius.nl/makelaars/amsterdam/amsterdam-life-homes"
              target="_blank"
              rel="noreferrer"
              className={styles.partner}
            >
              Pararius
            </a>
          </div>
        </div>

        {/* Bottom closure */}
        <div className={styles.closure}>
          <p className={styles.copy}>&copy; 2026 Welleton &amp; It&rsquo;s you. It&rsquo;s us. All rights reserved.</p>
          <div className={styles.legal}>
            <a href="/legal/privacy-policy" target="_blank" rel="noreferrer">Privacy Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

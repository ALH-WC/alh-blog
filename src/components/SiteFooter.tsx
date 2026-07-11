'use client';

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

// Dark site footer, shared by the blog index and article pages.
export function SiteFooter() {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const email = form.querySelector<HTMLInputElement>('input[type="email"]')?.value ?? '';
    const btn = form.querySelector<HTMLButtonElement>('button[type="submit"]');
    // Stub: same behavior as the other newsletter forms. TODO: wire to ESP.
    fetch('/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    }).catch(() => {});
    if (btn) {
      const original = btn.textContent;
      btn.textContent = 'Thank you';
      window.setTimeout(() => {
        btn.textContent = original;
      }, 2200);
    }
    form.reset();
  };

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
              <li><a href="mailto:home@amsterdamlifehomes.com">&#9993; home@amsterdamlifehomes.com</a></li>
              <li><a href="https://maps.app.goo.gl/TWnxv6xuUm15qNscA" target="_blank" rel="noreferrer">&#128205; Amsterdam, The Netherlands</a></li>
              <li><a href="tel:+31613749944">&#128222; +31 6 1374 9944</a></li>
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

          {/* Column 3: newsletter + partners */}
          <div className={styles.subscribe}>
            <div className={styles.subCopy}>
              <p className={styles.subTitle}>Subscribe to our newsletter</p>
              <p>If you would like to hear about great Amsterdam places to eat and drink.</p>
            </div>
            <form className={styles.form} onSubmit={handleSubmit}>
              <input type="email" placeholder="name@email.com" aria-label="Email address" required className={styles.input} />
              <button type="submit" className={styles.button}>Subscribe</button>
            </form>
            <p className={styles.disclaimer}>
              We care about your data in our{' '}
              <a href="/legal/privacy-policy" target="_blank" rel="noreferrer">privacy policy</a>.
            </p>
            <div className={styles.partners}>
              <span>We are proud partners of:</span>
              <a href="https://www.pararius.nl/makelaars/amsterdam/amsterdam-life-homes" target="_blank" rel="noreferrer" className={styles.partner}>Pararius</a>
            </div>
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

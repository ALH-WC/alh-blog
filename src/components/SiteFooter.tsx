import Link from 'next/link';
import styles from './SiteFooter.module.css';

// The site-wide footer, standardized on the renting page design (design
// system v2): brand block with the three-line tagline and plain contact
// lines, Navigate and Company columns, and the newsletter column, all on the
// warm --footer band. Column headings carry the sand highlight.
export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.grid}>
          {/* Brand / contact */}
          <div>
            <Link href="/" className={styles.logo}>Amsterdam Life Homes</Link>
            <p className={styles.tagline}>
              We help fellow expats<br />rent, let, and buy their home<br />in Amsterdam
            </p>
            <a className={styles.cline} href="mailto:home@amsterdamlifehomes.com">home@amsterdamlifehomes.com</a>
            <p className={styles.cline}>Amsterdam, The Netherlands</p>
            <a className={styles.cline} href="tel:+31613749944">+31 6 1374 9944</a>
            <p className={styles.hours}>Mon - Fri: 9 AM - 5 PM CEST</p>
            <div className={styles.social}>
              <a href="https://www.instagram.com/amsterdamlifehomes/" target="_blank" rel="noreferrer" aria-label="Instagram">
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" /></svg>
              </a>
              <a href="https://www.linkedin.com/company/amsterdamlifehomes" target="_blank" rel="noreferrer" aria-label="LinkedIn">
                <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor"><path d="M5 3.5A1.8 1.8 0 1 1 5 7a1.8 1.8 0 0 1 0-3.5zM3.6 8.6h2.8V20H3.6zM9 8.6h2.7v1.6h.1c.4-.7 1.4-1.6 2.9-1.6 3 0 3.6 2 3.6 4.5V20h-2.8v-5.6c0-1.3 0-3-1.9-3s-2.1 1.4-2.1 2.9V20H9z" /></svg>
              </a>
              <a href="https://www.youtube.com/@AmsterdamLifeHomes" target="_blank" rel="noreferrer" aria-label="YouTube">
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="2.5" y="6" width="19" height="13" /><path d="M10 9.8l5 2.7-5 2.7z" fill="currentColor" stroke="none" /></svg>
              </a>
              <a href="https://www.tiktok.com/@amsterdamlife.homes" target="_blank" rel="noreferrer" aria-label="TikTok">
                <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor"><path d="M14 3h2.6c.3 1.7 1.5 3 3.4 3.2V9c-1.3 0-2.5-.5-3.4-1.2v6.4A5.7 5.7 0 1 1 10 8.6v2.9a2.8 2.8 0 1 0 2 2.7V3z" /></svg>
              </a>
            </div>
          </div>

          {/* Navigate */}
          <div>
            <h4 className={styles.colhead}>Navigate</h4>
            <a className={styles.flink} href="https://amsterdamlifehomes.com/renting">Renting</a>
            <a className={styles.flink} href="https://amsterdamlifehomes.com/buying">Buying</a>
            <a className={styles.flink} href="https://amsterdamlifehomes.com/letting">Letting</a>
            <a className={styles.flink} href="https://amsterdamlifehomes.com/b2b">B2B</a>
          </div>

          {/* Company */}
          <div>
            <h4 className={styles.colhead}>Company</h4>
            <a className={styles.flink} href="https://amsterdamlifehomes.com/#about-us">About us</a>
            <a className={styles.flink} href="https://amsterdamlifehomes.com/#review">Reviews</a>
            <Link className={styles.flink} href="/blog">Our Amsterdam Guide</Link>
            <a className={styles.flink} href="https://amsterdamlifehomes.com/contact">Contact</a>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className={styles.colhead}>New guides, straight from us.</h4>
            <p className={styles.newsdek}>
              Receive our articles by email.<br />No fluff, no spam.<br />Unsubscribe anytime.
            </p>
            <input className={styles.email} type="email" placeholder="Your email address" aria-label="Your email address" />
            <button className={styles.subscribe} type="button">
              Subscribe <span className={styles.ar}>&rarr;</span>
            </button>
          </div>
        </div>

        <div className={styles.bottom}>
          <span>&copy; 2026 Welleton &amp; It&apos;s you. It&apos;s us. All rights reserved.</span>
          <span className={styles.legal}>
            <a href="https://amsterdamlifehomes.com/cookies">Cookie Settings</a>
            <a href="https://amsterdamlifehomes.com/privacy">Privacy Policy</a>
          </span>
        </div>
      </div>
    </footer>
  );
}

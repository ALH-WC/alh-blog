import Link from 'next/link';
import styles from '../app/blog/blog.module.css';

// Static site footer, shared by the blog index and article pages.
export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footGrid}>
        <div>
          <div className={styles.footBrandRow}>
            <span className={styles.brandMark} aria-hidden />
            <span className={styles.footBrandName}>Amsterdam Life Homes</span>
          </div>
          <p className={styles.footText}>We help fellow expats rent, let, and buy their home in Amsterdam.</p>
          <p className={styles.footContact}>
            hello@amsterdamlifehomes.com<br />+31 6 1374 9944
          </p>
        </div>
        <div className={styles.footLinks}>
          <a href="/renting" className={styles.footLink}>Renting</a>
          <a href="/buying" className={styles.footLink}>Buying</a>
          <a href="/letting" className={styles.footLink}>Letting</a>
          <a href="/b2b" className={styles.footLink}>Corporate</a>
          <Link href="/blog" className={styles.footLink}>The Amsterdam Guide</Link>
        </div>
        <div>
          <p className={styles.footNlTitle}>Amsterdam Life Homes</p>
          <p className={styles.footNlSub}>The relocation guide we wish someone had handed us.</p>
        </div>
      </div>
      <div className={styles.footBottom}>&copy; 2026 Amsterdam Life Homes. All rights reserved.</div>
    </footer>
  );
}

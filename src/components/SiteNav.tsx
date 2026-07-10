'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './SiteNav.module.css';

const CAL_URL = 'https://cal.com/amsterdam-life-homes/intake';

// Reconstructed from the ALH Framer "Navigation" component.
const LINKS = [
  { href: '/renting', label: 'Renting' },
  { href: '/buying', label: 'Buying' },
  { href: '/letting', label: 'Letting' },
  { href: '/b2b', label: 'Corporate' },
  { href: '/#about-us', label: 'About us' },
  { href: '/blog', label: 'Our Amsterdam guide', current: true },
];

// Blog pages are served by this app; the other routes are served by the main
// Framer site, so they use a full navigation rather than client-side routing.
function NavLink({ href, label, current, onClick }: { href: string; label: string; current?: boolean; onClick?: () => void; className?: string }) {
  const cls = `${styles.link}${current ? ` ${styles.linkCurrent}` : ''}`;
  const currentAttr = current ? { 'aria-current': 'page' as const } : {};
  if (href.startsWith('/blog')) {
    return (
      <Link href={href} className={cls} onClick={onClick} {...currentAttr}>
        {label}
      </Link>
    );
  }
  return (
    <a href={href} className={cls} onClick={onClick} {...currentAttr}>
      {label}
    </a>
  );
}

export function SiteNav() {
  const [open, setOpen] = useState(false);
  return (
    <nav className={styles.nav} aria-label="Primary">
      <div className={styles.inner}>
        <Link href="/blog" className={styles.logoWrap} aria-label="Amsterdam Life Homes home">
          <span className={styles.logo}>Amsterdam Life Homes</span>
        </Link>

        <div className={styles.links}>
          {LINKS.map((l) => (
            <NavLink key={l.href} href={l.href} label={l.label} current={l.current} />
          ))}
        </div>

        <div className={styles.buttons}>
          <a href={CAL_URL} className={styles.cta}>Contact us</a>
        </div>

        <button
          type="button"
          className={styles.menuBtn}
          aria-label="Open menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            {open ? <path d="M6 6l12 12M6 18L18 6" /> : <><path d="M3 6h18" /><path d="M3 12h18" /><path d="M3 18h18" /></>}
          </svg>
        </button>
      </div>

      <span className={styles.hairline} aria-hidden="true" />

      {open ? (
        <div className={styles.drawer}>
          {LINKS.map((l) => (
            <NavLink key={l.href} href={l.href} label={l.label} current={l.current} onClick={() => setOpen(false)} />
          ))}
          <a href={CAL_URL} className={styles.drawerCta} onClick={() => setOpen(false)}>Contact us</a>
        </div>
      ) : null}
    </nav>
  );
}
